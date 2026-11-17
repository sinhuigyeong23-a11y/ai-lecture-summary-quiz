// [Model] 마이페이지: 문구 · 학습 통계 · 내 학습 파일(요약본 / 시험지 / 오답노트) 목록

import {
  deleteQuizSet,
  deleteSummary,
  deleteWrongNote,
  formatDate,
  quizSetLabel,
  type Lecture,
  type LectureListItem,
} from './study'
import type { StudyFileTarget } from './pdf'

export const myPageContent = {
  titleLines: ['마이페이지'],
  subtitle: (name: string) => `${name}님의 학습 기록이에요`,
  loading: '불러오는 중이에요…',
  backLabel: '이전',
  filesTitle: '내 학습 파일',
  empty: '아직 학습 기록이 없어요. 강의 자료를 올려서 시작해보세요!',
  noFiles: '이 종류의 파일이 아직 없어요.',
  startLabel: '학습 시작하기',
  openLecture: '학습 공간 열기',
  exportPdf: 'PDF로 내보내기',
  exporting: 'PDF 만드는 중…',
  close: '닫기',
  remove: '삭제',
  removeConfirm: '한 번 더 누르면 삭제',
  removeHint: '시험지를 지워도 오답노트에 담은 문제는 남아요.',
}

export type FileKind = StudyFileTarget['kind']

export const fileFilters: { id: FileKind | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'summary', label: '📘 요약본' },
  { id: 'quiz', label: '📝 퀴즈' },
  { id: 'wrong', label: '❌ 오답노트' },
]

/** 학습 파일 1개 */
export interface StudyFile {
  key: string
  lecture: Lecture
  target: StudyFileTarget
  icon: string
  name: string
  /** 옆에 보여줄 짧은 정보 (점수 · 개수 · 날짜) */
  info: string
}

/** 강의마다 만들어 둔 요약본 · 시험지 · 오답노트를 파일 목록으로 */
export function studyFiles(lectures: Lecture[]): StudyFile[] {
  return lectures.flatMap((lecture) => {
    const files: StudyFile[] = []
    if (lecture.summary || lecture.summaryDetail || lecture.reviewNote) {
      files.push({ key: `${lecture.id}-summary`, lecture, target: { kind: 'summary' }, icon: '📘', name: '요약본', info: formatDate(lecture.createdAt) })
    }
    lecture.quizSets.forEach((set, i) => {
      files.push({
        key: `${lecture.id}-quiz-${set.id}`,
        lecture,
        target: { kind: 'quiz', setId: set.id },
        icon: '📝',
        name: quizSetLabel(set, i),
        info: set.revealed ? `${set.correctCount} / ${set.questions.length}점` : '채점 전',
      })
    })
    lecture.wrongNotes.forEach((note) => {
      files.push({
        key: `${lecture.id}-wrong-${note.id}`,
        lecture,
        target: { kind: 'wrong', noteId: note.id },
        icon: '❌',
        name: note.title,
        info: `문제 ${note.questions.length}개`,
      })
    })
    return files
  })
}

/** 파일 삭제 (요약본 / 시험지 / 오답노트). 바뀐 강의를 돌려줌 */
export function deleteStudyFile(file: StudyFile): Promise<Lecture> {
  const t = file.target
  const id = file.lecture.id
  if (t.kind === 'summary') return deleteSummary(id)
  if (t.kind === 'quiz') return deleteQuizSet(id, t.setId)
  return deleteWrongNote(String(id), t.noteId)
}

/** 학습 공간에서 이 파일 화면을 바로 열기 위한 주소 (예: /lectures/3?view=quiz-12) */
export function openInWorkspace(file: StudyFile) {
  const t = file.target
  const view = t.kind === 'summary' ? 'summary' : t.kind === 'quiz' ? `quiz-${t.setId}` : `wrong-${t.noteId}`
  return `/lectures/${file.lecture.id}?view=${view}`
}

export interface StatItem {
  label: string
  value: string
}

/** 상단 통계 카드: 학습한 강의 · 푼 문제 · 정답률 */
export function myPageStats(lectures: LectureListItem[]): StatItem[] {
  const answered = lectures.reduce((sum, l) => sum + l.answeredCount, 0)
  const correct = lectures.reduce((sum, l) => sum + l.correctCount, 0)
  return [
    { label: '학습한 강의', value: `${lectures.length}개` },
    { label: '푼 문제', value: `${answered}개` },
    { label: '정답률', value: answered ? `${Math.round((correct / answered) * 100)}%` : '-' },
  ]
}
