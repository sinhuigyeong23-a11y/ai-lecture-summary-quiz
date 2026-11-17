import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ApiError, errorMessage } from '../models/api'
import {
  analyzeWrong,
  answerQuestion,
  deleteWrongNote,
  exportToWrongNote,
  fetchLecture,
  makeQuizSet,
  makeSimilarSet,
  makeSummary,
  quizSetLabel,
  renameWrongNote,
  retryMissed,
  revealQuizSet,
  workspaceContent,
  type Difficulty,
  type Lecture,
  type Quiz,
  type QuizSet,
  type QuizType,
  type SummarySection,
} from '../models/study'

/** 오른쪽에 보이는 화면 */
export type View =
  | { kind: 'welcome' }
  | { kind: 'summary' }
  | { kind: 'quiz'; setId: number }
  | { kind: 'wrong' } // 오답노트 파일 목록
  | { kind: 'wrongNote'; noteId: number } // 오답노트 파일 1개
/** 떠 있는 창 */
export type DialogKind = 'summary' | 'quiz' | 'export' | null

const SIMILAR_COUNT = 3

/** 주소의 ?view= 값으로 처음 열 화면 (마이페이지 '학습 공간 열기'에서 씀) */
function viewFromQuery(value: string | null, lecture: Lecture): View {
  if (value === 'summary') return { kind: 'summary' }
  const [kind, raw] = (value ?? '').split('-')
  const num = Number(raw)
  if (kind === 'quiz' && lecture.quizSets.some((s) => s.id === num)) return { kind: 'quiz', setId: num }
  if (kind === 'wrong' && lecture.wrongNotes.some((n) => n.id === num)) return { kind: 'wrongNote', noteId: num }
  return { kind: 'welcome' }
}

// 학습 공간: 처음 화면 · 요약/퀴즈 만들기 창 · 시험지 풀기 · 정답 보기 · 오답노트 파일함
export function useLectureController(id: string) {
  const navigate = useNavigate()
  const [query] = useSearchParams()
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [view, setView] = useState<View>({ kind: 'welcome' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'' | 'make' | 'reveal' | 'export' | 'analysis' | 'retry' | 'similar' | 'note'>('')

  // 만들기 창 상태
  const [dialog, setDialog] = useState<DialogKind>(null)
  const [step, setStep] = useState(0)
  const [sections, setSections] = useState<SummarySection[]>(['overview', 'keywords', 'concepts', 'easy', 'exam'])
  const [types, setTypes] = useState<QuizType[]>(['multiple'])
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [count, setCount] = useState(5)

  /** AI 작업 중 지난 시간(초): 버튼에 실제 걸린 시간을 보여줌 */
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    setElapsed(0)
    if (!busy) return
    const timer = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(timer)
  }, [busy])

  useEffect(() => {
    fetchLecture(id)
      .then((data) => {
        setLecture(data)
        setView(viewFromQuery(query.get('view'), data))
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login', { replace: true, state: { from: `/lectures/${id}` } })
        } else {
          setError(errorMessage(err))
        }
      })
    // 처음 열 때만 주소의 view를 봄
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate])

  /** 서버 작업 후 강의를 새로 받는 공통 처리 */
  const run = async (kind: typeof busy, task: () => Promise<Lecture>, after?: (data: Lecture) => void) => {
    setBusy(kind)
    setError('')
    try {
      const data = await task()
      setLecture(data)
      after?.(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy('')
    }
  }

  const openLatestSet = (data: Lecture) => {
    const last = data.quizSets.at(-1)
    if (last) setView({ kind: 'quiz', setId: last.id })
  }

  // ---- 만들기 창 ----
  const openDialog = (kind: Exclude<DialogKind, null>) => {
    setError('')
    setStep(0)
    setDialog(kind)
  }
  const closeDialog = () => busy !== 'make' && busy !== 'export' && setDialog(null)
  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const submitSummary = () =>
    run('make', () => makeSummary(id, sections), () => {
      setDialog(null)
      setView({ kind: 'summary' })
    })

  const submitQuiz = () =>
    run('make', () => makeQuizSet(id, { types, difficulty, count }), (data) => {
      setDialog(null)
      openLatestSet(data)
    })

  // ---- 시험지 ----
  const replaceQuestion = (updated: Quiz) =>
    setLecture((prev) =>
      prev && {
        ...prev,
        quizSets: prev.quizSets.map((s) => ({
          ...s,
          questions: s.questions.map((q) => (q.id === updated.id ? updated : q)),
        })),
      },
    )

  /** 답 고르기 / 쓰기: 화면에 바로 반영하고 저장 (정답 보기 전까지 바꿀 수 있음) */
  const answer = (q: Quiz, value: { choiceIndex?: number; text?: string }) => {
    replaceQuestion({ ...q, selectedIndex: value.choiceIndex ?? null, selectedText: value.text ?? null })
    if (q.type === 'short') return // 주관식은 입력칸을 벗어날 때 저장
    answerQuestion(id, q.id, value).catch((err) => setError(errorMessage(err)))
  }

  const saveShort = (q: Quiz) =>
    answerQuestion(id, q.id, { text: q.selectedText ?? '' }).catch((err) => setError(errorMessage(err)))

  const reveal = (setId: number) => run('reveal', () => revealQuizSet(id, setId))

  // ---- 채점 후: 고른 문제만 오답노트로 내보내기 ----
  /** 사용자가 직접 바꾼 체크 (없으면 기본값: 틀린 문제) */
  const [picks, setPicks] = useState<Record<number, boolean>>({})
  const [exported, setExported] = useState<{ count: number; noteId: number } | null>(null)
  const isPicked = (q: Quiz) => picks[q.id] ?? !q.correct
  const togglePick = (q: Quiz) => setPicks((prev) => ({ ...prev, [q.id]: !isPicked(q) }))
  /** 아직 오답노트에 없는 문제 중 고른 것 */
  const pickedIn = (set: QuizSet) => set.questions.filter((q) => !q.missed && isPicked(q))

  /** 내보낼 곳: 'new' = 새 파일, 숫자 = 기존 파일 id */
  const [exportTarget, setExportTarget] = useState<'new' | number>('new')
  const [exportTitle, setExportTitle] = useState('')

  const openExport = (set: QuizSet) => {
    if (!lecture) return
    setExportTarget('new')
    setExportTitle(workspaceContent.exportDialog.defaultTitle(quizSetLabel(set, lecture.quizSets.indexOf(set))))
    openDialog('export')
  }

  const submitExport = (set: QuizSet) => {
    const ids = pickedIn(set).map((q) => q.id)
    const target = exportTarget === 'new' ? { title: exportTitle } : { noteId: exportTarget }
    return run('export', () => exportToWrongNote(id, target, ids), (data) => {
      setPicks({})
      setDialog(null)
      const noteId = exportTarget === 'new' ? (data.wrongNotes.at(-1)?.id ?? 0) : exportTarget
      setExported({ count: ids.length, noteId })
    })
  }

  // 다른 화면으로 가면 내보내기 안내를 지움
  useEffect(() => setExported(null), [view])

  // ---- 오답노트 파일함 ----
  const openNote = (noteId: number) => setView({ kind: 'wrongNote', noteId })
  const rename = (noteId: number, title: string) => run('note', () => renameWrongNote(id, noteId, title))
  const remove = (noteId: number) => run('note', () => deleteWrongNote(id, noteId), () => setView({ kind: 'wrong' }))

  const requestAnalysis = (noteId: number) => run('analysis', () => analyzeWrong(id, noteId))
  const requestRetry = (noteId: number) => run('retry', () => retryMissed(id, noteId), openLatestSet)
  const requestSimilar = (noteId: number) =>
    run('similar', () => makeSimilarSet(id, noteId, SIMILAR_COUNT), openLatestSet)

  /** 노트를 저장하면 화면 데이터도 바꿔서, 화면을 오가도 쓴 내용이 유지되게 */
  const setNoteContent = (noteId: number, content: string) =>
    setLecture((prev) => prev && { ...prev, wrongNotes: prev.wrongNotes.map((n) => (n.id === noteId ? { ...n, content } : n)) })

  return {
    lecture,
    view,
    setView,
    error,
    busy,
    elapsed,
    dialog,
    openDialog,
    closeDialog,
    step,
    setStep,
    sections,
    toggleSection: (s: SummarySection) => setSections((prev) => toggle(prev, s)),
    types,
    toggleType: (t: QuizType) => setTypes((prev) => toggle(prev, t)),
    difficulty,
    setDifficulty,
    count,
    setCount,
    submitSummary,
    submitQuiz,
    answer,
    saveShort,
    reveal,
    isPicked,
    togglePick,
    pickedIn,
    exportTarget,
    setExportTarget,
    exportTitle,
    setExportTitle,
    openExport,
    submitExport,
    exported,
    openNote,
    rename,
    remove,
    requestAnalysis,
    requestRetry,
    requestSimilar,
    setNoteContent,
  }
}
