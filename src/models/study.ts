// [Model] 자료 올리기 · 학습 공간(요약 · 퀴즈 시험지 · 오답노트) 콘텐츠와 API

import { api } from './api'

export type QuizType = 'multiple' | 'short' | 'ox'
export type Difficulty = 'easy' | 'normal' | 'hard'
export type SummarySection = 'overview' | 'keywords' | 'concepts' | 'easy' | 'exam'

/** 자료 올리기 화면 */
export const studyPageContent = {
  titleLines: ['어떤 강의를', '공부해볼까요?'],
  subtitle: '자료를 올리면 AI가 요약 · 퀴즈 · 오답노트를 만들어드려요',
  upload: {
    label: '강의 자료 올리기',
    hint: '클릭하거나 파일을 끌어다 놓으세요 · PDF, TXT (15MB 이하)',
    accept: '.pdf,.txt',
  },
  text: {
    name: 'lectureText',
    label: '또는 강의 내용 붙여넣기',
    placeholder: '강의 필기나 교재 내용을 붙여넣어 주세요',
  },
  submitLabel: '자료 올리고 시작하기',
  loadingLabel: '올리는 중…',
  messages: { noInput: '강의 자료를 올리거나 내용을 붙여넣어 주세요.' },
}

/** 요약 만들기 창: 만들 항목 (여러 개) */
export const summarySections: { id: SummarySection; label: string; title: string }[] = [
  { id: 'overview', label: '전체 내용 요약', title: '📘 전체 내용 요약' },
  { id: 'keywords', label: '핵심 키워드', title: '🔑 핵심 키워드' },
  { id: 'concepts', label: '중요 개념 · 용어 정리', title: '📚 중요 개념 · 용어 정리' },
  { id: 'easy', label: '어려운 문장 쉽게 풀어쓰기', title: '💡 어려운 문장 쉽게 풀어쓰기' },
  { id: 'exam', label: '시험에 나올 내용 표시', title: '⭐ 시험에 나올 만한 내용' },
]

/** 퀴즈 만들기 창: 단계별 선택 */
export const quizWizard = {
  steps: ['문제 유형', '난이도', '문제 개수'],
  types: [
    { id: 'multiple', label: '객관식', desc: '보기 4개 중 하나' },
    { id: 'short', label: '주관식', desc: '단어로 직접 쓰기' },
    { id: 'ox', label: 'OX', desc: '맞으면 O, 틀리면 X' },
  ] as { id: QuizType; label: string; desc: string }[],
  difficulties: [
    { id: 'easy', label: '쉬움', desc: '기본 개념 확인' },
    { id: 'normal', label: '보통', desc: '개념 이해와 적용' },
    { id: 'hard', label: '어려움', desc: '응용 · 헷갈리는 함정' },
  ] as { id: Difficulty; label: string; desc: string }[],
  counts: [3, 5, 10, 15, 20],
}

export const workspaceContent = {
  loading: '불러오는 중이에요…',
  subtitle: 'AI와 함께 공부하는 학습 공간이에요',
  menu: {
    summary: '📘 요약 · 키워드 · 개념',
    quiz: '📝 퀴즈 생성',
    wrong: '❌ 오답노트',
    myPage: '👤 마이페이지',
    upload: '새 자료 올리기',
  },
  welcome: {
    title: '무엇부터 해볼까요?',
    text: '요약을 만들거나 퀴즈를 풀어보세요. 푼 문제는 저장되고, 틀린 문제는 오답노트에 모여요.',
  },
  dialog: {
    cancel: '취소',
    prev: '이전',
    next: '다음',
    summaryTitle: '요약 만들기',
    summaryHint: '만들 항목을 골라주세요 (여러 개 선택 가능)',
    summarySubmit: '요약 만들기',
    summaryShow: '만든 요약 보기',
    madeBadge: '이미 있음 · AI 안 씀',
    refreshLabel: '이미 만든 항목도 새로 만들기',
    quizTitle: '퀴즈 만들기',
    quizHints: ['문제 유형을 골라주세요 (여러 개 선택 가능)', '난이도를 골라주세요', '몇 문제를 만들까요?'],
    quizSubmit: '퀴즈 만들기',
    making: (sec: number) => `AI가 만드는 중이에요… ${sec}초`,
  },
  conceptQuiz: {
    hint: '키워드나 개념을 눌러 고르면, 그 개념만 골라 퀴즈를 만들 수 있어요.',
    make: (n: number) => `고른 개념 ${n}개로 퀴즈 만들기`,
    clear: '선택 해제',
    inDialog: (list: string[]) => `고른 개념만 출제: ${list.join(', ')}`,
  },
  summary: { remake: '다시 만들기', easyOriginal: '원문', easyPlain: '쉽게', empty: '아직 요약이 없어요.' },
  paper: {
    typeLabel: { multiple: '객관식', short: '주관식', ox: 'OX' } as Record<QuizType, string>,
    difficultyLabel: { easy: '쉬움', normal: '보통', hard: '어려움' } as Record<Difficulty, string>,
    kindLabel: { normal: '시험지', retry: '오답 다시 풀기', similar: '비슷한 문제' } as Record<QuizSetKind, string>,
    shortPlaceholder: '답을 입력하세요',
    reveal: '정답 보기',
    revealHint: '다 풀었으면 정답 보기를 눌러 채점하세요. 채점하면 답을 바꿀 수 없어요.',
    unanswered: (n: number) => `아직 안 푼 문제가 ${n}개 있어요`,
    score: (correct: number, total: number) => `${correct} / ${total}`,
    answerLabel: '정답',
    explanation: '해설',
    notAnswered: '(안 풀었어요)',
    pick: '오답노트에 담기',
    inNote: '📒 오답노트에 있어요',
    exportHint: '틀린 문제는 미리 골라뒀어요. 헷갈렸던 문제도 체크해서 같이 담을 수 있어요.',
    export: (n: number) => `선택한 ${n}문제 오답노트로 내보내기`,
    exported: (n: number) => `${n}문제를 오답노트에 담았어요!`,
    retryHint: '다시 풀기 결과는 오답노트에 자동으로 반영돼요. 맞힌 문제는 ✅ 해결로 바뀌어요.',
    goWrong: '오답노트 보기',
    newQuiz: '새 퀴즈 만들기',
  },
  /** 오답노트로 내보내기 창 */
  exportDialog: {
    title: '오답노트로 내보내기',
    hint: '어디에 담을까요?',
    newNote: '+ 새 오답노트 만들기',
    titleLabel: '새 오답노트 제목',
    defaultTitle: (setName: string) => `${setName} 오답`,
    submit: (n: number) => `${n}문제 담기`,
  },
  wrong: {
    listTitle: '내 오답노트',
    listHint: '파일을 누르면 내용이 열려요. 이름을 바꾸거나 지울 수 있어요.',
    empty: '아직 오답노트가 없어요. 퀴즈를 풀고 정답 보기 → 오답노트로 내보내기를 누르면 여기에 파일이 생겨요!',
    count: (open: number, total: number) => (open === total ? `문제 ${total}개` : `문제 ${total}개 · 해결 ${total - open}개`),
    rename: '이름 바꾸기',
    save: '저장',
    remove: '삭제',
    removeConfirm: '한 번 더 누르면 삭제',
    backToList: '← 오답노트 목록',
    noQuestions: '이 오답노트에는 아직 문제가 없어요.',
    analyze: '🤖 AI 오답 분석',
    analyzing: (sec: number) => `AI가 분석하는 중… ${sec}초`,
    retry: '🔁 틀린 문제만 다시 풀기',
    similar: '➕ 비슷한 유형 문제 만들기',
    making: (sec: number) => `문제 만드는 중… ${sec}초`,
    showResolved: '해결한 문제도 보기',
    resolved: '✅ 다시 풀어서 맞혔어요',
    mine: '내 답',
    answer: '정답',
    reason: '틀린 이유',
    detail: '상세 해설',
    concept: '관련 개념 다시 보기',
    noAnalysis: "'AI 오답 분석'을 누르면 틀린 이유 · 상세 해설 · 관련 개념을 정리해줘요.",
    myNote: '✏️ 내 오답노트 (직접 꾸미기)',
  },
}

export type QuizSetKind = 'normal' | 'retry' | 'similar'

export interface WrongAnalysis {
  reason: string
  detail: string
  concept: string
}

export interface Quiz {
  id: number
  setId: number | null
  type: QuizType
  question: string
  /** 객관식 보기 (OX는 ["O","X"], 주관식은 빈 배열) */
  choices: string[]
  /** 정답 · 해설 · 채점 결과는 '정답 보기' 전에는 비어 있음 (answerIndex -1, null) */
  answerIndex: number
  answerText: string | null
  explanation: string | null
  correct: boolean | null
  /** 내가 고른 보기 / 쓴 답 */
  selectedIndex: number | null
  selectedText: string | null
  /** 오답노트에 있음 / 다시 풀어서 맞힘 / 비슷한 유형으로 만든 문제 */
  missed: boolean
  resolved: boolean
  similar: boolean
  analysis: WrongAnalysis | null
}

export interface QuizSet {
  id: number
  kind: QuizSetKind
  types: QuizType[]
  difficulty: Difficulty | null
  revealed: boolean
  correctCount: number
  questions: Quiz[]
  createdAt: string
}

export interface SummaryDetail {
  overview?: string | null
  keywords?: string[] | null
  concepts?: { term: string; meaning: string }[] | null
  easySentences?: { original: string; easy: string }[] | null
  examPoints?: string[] | null
}

export interface Lecture {
  id: number
  title: string
  summary: string | null
  summaryDetail: string | null
  /** 예전 버전 복습 노트 */
  reviewNote: string | null
  quizSets: QuizSet[]
  /** 오답노트 파일들 */
  wrongNotes: WrongNoteFile[]
  createdAt: string
}

/** 오답노트 파일 1개 */
export interface WrongNoteFile {
  id: number
  title: string
  /** 직접 꾸민 노트 (편집기 JSON 문자열, 아직 안 꾸몄으면 null) */
  content: string | null
  questions: Quiz[]
  createdAt: string
}

/** 모든 오답노트 파일의 문제 (챗봇 · 통계용) */
export const allWrongQuestions = (lecture: Lecture) => lecture.wrongNotes.flatMap((n) => n.questions)

export interface LectureListItem {
  id: number
  title: string
  createdAt: string
  hasSummary: boolean
  quizSetCount: number
  quizCount: number
  answeredCount: number
  correctCount: number
  missedCount: number
}

/** 세부 요약 꺼내기 (없거나 깨졌으면 빈 값) */
export function summaryDetail(lecture: Lecture): SummaryDetail {
  if (!lecture.summaryDetail) return {}
  try {
    return JSON.parse(lecture.summaryDetail) as SummaryDetail
  } catch {
    return {}
  }
}

export const hasSummary = (lecture: Lecture) => Boolean(lecture.summary || lecture.summaryDetail || lecture.reviewNote)

/** 시험지 이름 (예: "시험지 2 · 객관식/OX · 보통") */
export function quizSetLabel(set: QuizSet, index: number) {
  const p = workspaceContent.paper
  const parts = [`${p.kindLabel[set.kind]} ${index + 1}`]
  if (set.types.length) parts.push(set.types.map((t) => p.typeLabel[t]).join('/'))
  if (set.difficulty) parts.push(p.difficultyLabel[set.difficulty])
  return parts.join(' · ')
}

export const isAnswered = (q: Quiz) => (q.type === 'short' ? Boolean(q.selectedText?.trim()) : q.selectedIndex !== null)

/** 문제의 정답을 글자로 (정답 보기 후에만 있음) */
export const correctAnswer = (q: Quiz) => (q.type === 'short' ? (q.answerText ?? '') : (q.choices[q.answerIndex] ?? ''))

/** 내가 고른/쓴 답을 글자로 */
export const myAnswer = (q: Quiz) => (q.type === 'short' ? (q.selectedText ?? '') : (q.choices[q.selectedIndex ?? -1] ?? ''))

/** AI가 쓴 마크다운을 화면 · PDF용 블록으로 (제목 / 글머리표 / 문단) */
export type NoteBlock = { type: 'heading' | 'item' | 'text'; text: string }

export function parseNote(markdown: string): NoteBlock[] {
  return markdown
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): NoteBlock => {
      const clean = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\$([^$]+)\$/g, '$1').replace(/_/g, '')
      if (/^#{1,6}\s/.test(line)) return { type: 'heading', text: clean(line.replace(/^#+\s*/, '')) }
      if (/^([-*•]|\d+\.)\s/.test(line)) return { type: 'item', text: clean(line.replace(/^([-*•]|\d+\.)\s*/, '')) }
      return { type: 'text', text: clean(line) }
    })
}

// ---- API ----

export function createLecture(file: File | null, text: string) {
  const form = new FormData()
  if (file) form.append('file', file)
  if (text.trim()) form.append('text', text)
  return api<Lecture>('/lectures', { method: 'POST', body: form })
}

export const fetchLectures = () => api<LectureListItem[]>('/lectures')

export const fetchLecture = (id: string | number) => api<Lecture>(`/lectures/${id}`)

const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

/** refresh=false면 이미 만든 항목은 AI를 다시 부르지 않음 */
export const makeSummary = (id: string, sections: SummarySection[], refresh = false) =>
  post<Lecture>(`/lectures/${id}/summary`, { sections, refresh })

/** 이미 만들어 둔 요약 항목들 */
export function madeSections(lecture: Lecture): SummarySection[] {
  const d = summaryDetail(lecture)
  const has: Record<SummarySection, boolean> = {
    overview: Boolean(d.overview || lecture.summary),
    keywords: Boolean(d.keywords?.length),
    concepts: Boolean(d.concepts?.length),
    easy: Boolean(d.easySentences?.length),
    exam: Boolean(d.examPoints?.length),
  }
  return summarySections.map((s) => s.id).filter((id) => has[id])
}

/** concepts: 요약에서 고른 개념만 다루는 퀴즈 (비우면 자료 전체) */
export const makeQuizSet = (id: string, options: { types: QuizType[]; difficulty: Difficulty; count: number; concepts?: string[] }) =>
  post<Lecture>(`/lectures/${id}/quiz-sets`, options)

/** 답 저장 (정답 보기 전까지 바꿀 수 있음) */
export const answerQuestion = (id: string, questionId: number, answer: { choiceIndex?: number; text?: string }) =>
  api<Quiz>(`/lectures/${id}/quiz/${questionId}`, { method: 'PUT', body: JSON.stringify(answer) })

export const revealQuizSet = (id: string, setId: number) => post<Lecture>(`/lectures/${id}/quiz-sets/${setId}/reveal`)

/** 채점한 시험지에서 고른 문제만 오답노트로 */
export const exportToWrongNote = (id: string, target: { noteId?: number; title?: string }, questionIds: number[]) =>
  post<Lecture>(`/lectures/${id}/wrong-notes`, { ...target, questionIds })

export const deleteSummary = (id: string | number) => api<Lecture>(`/lectures/${id}/summary`, { method: 'DELETE' })

export const deleteQuizSet = (id: string | number, setId: number) =>
  api<Lecture>(`/lectures/${id}/quiz-sets/${setId}`, { method: 'DELETE' })

export const renameWrongNote =(id: string, noteId: number, title: string) =>
  api<Lecture>(`/lectures/${id}/wrong-notes/${noteId}`, { method: 'PATCH', body: JSON.stringify({ title }) })

export const deleteWrongNote = (id: string, noteId: number) =>
  api<Lecture>(`/lectures/${id}/wrong-notes/${noteId}`, { method: 'DELETE' })

export const retryMissed = (id: string, noteId: number) => post<Lecture>(`/lectures/${id}/wrong-notes/${noteId}/retry`)

export const makeSimilarSet = (id: string, noteId: number, count: number) =>
  post<Lecture>(`/lectures/${id}/wrong-notes/${noteId}/similar`, { count })

export const analyzeWrong = (id: string, noteId: number) => post<Lecture>(`/lectures/${id}/wrong-notes/${noteId}/analysis`)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
