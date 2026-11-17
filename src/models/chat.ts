// [Model] AI 튜터 챗봇: 화면 문구, '무엇에 대해 물어볼지' 선택지, 챗봇 API

import { api } from './api'
import { correctAnswer, myAnswer, quizSetLabel, summaryDetail, type Lecture, type Quiz } from './study'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const chatContent = {
  openLabel: 'AI 튜터에게 물어보기',
  title: 'AI 튜터',
  close: '닫기',
  focusLabel: '무엇에 대해 물어볼까요?',
  greeting: '궁금한 걸 물어보세요! 위에서 내가 푼 시험지나 틀린 문제를 고르면 그걸 보고 설명해줄게요.',
  placeholder: '질문을 입력하세요',
  sendLabel: '보내기',
  thinking: '생각하는 중이에요…',
  suggestions: ['이거 쉽게 설명해줘', '왜 틀렸는지 알려줘', '비슷한 예시 하나 들어줘'],
}

/** 물어볼 대상 하나: AI에게는 text를 같이 보냄 */
export interface ChatFocus {
  id: string
  label: string
  text: string
}

const describeQuestion = (q: Quiz, no: number) => {
  const lines = [`${no}. ${q.question}`]
  if (q.choices.length) lines.push(`보기: ${q.choices.join(' / ')}`)
  lines.push(`내 답: ${myAnswer(q) || '(안 풀었음)'}`)
  if (q.correct !== null) {
    lines.push(`정답: ${correctAnswer(q)} (${q.correct ? '맞힘' : '틀림'})`)
    if (q.explanation) lines.push(`해설: ${q.explanation}`)
  }
  return lines.join('\n')
}

/** 선택지: 강의 전체 · 요약 · 내 시험지들 · 틀린 문제 하나하나 */
export function chatFocusOptions(lecture: Lecture): ChatFocus[] {
  const options: ChatFocus[] = [{ id: 'all', label: '강의 전체', text: '' }]

  const d = summaryDetail(lecture)
  if (lecture.summary || lecture.summaryDetail) {
    options.push({ id: 'summary', label: '📘 요약 · 키워드 · 개념', text: `[요약]\n${d.overview ?? lecture.summary ?? ''}` })
  }
  lecture.quizSets.forEach((set, i) => {
    const status = set.revealed ? `채점함 ${set.correctCount}/${set.questions.length}` : '푸는 중 (정답은 아직 알려주지 마)'
    options.push({
      id: `set-${set.id}`,
      label: `📝 ${quizSetLabel(set, i)}`,
      text: `[${quizSetLabel(set, i)} · ${status}]\n${set.questions.map((q, n) => describeQuestion(q, n + 1)).join('\n\n')}`,
    })
  })
  lecture.wrongNotes.forEach((note) => {
    options.push({
      id: `note-${note.id}`,
      label: `❌ ${note.title} (문제 ${note.questions.length}개)`,
      text: `[오답노트: ${note.title}]\n${note.questions.map((q, n) => describeQuestion(q, n + 1)).join('\n\n')}`,
    })
    note.questions.forEach((q, i) => {
      options.push({
        id: `wrong-${q.id}`,
        label: `　└ ${i + 1}. ${q.question.slice(0, 22)}${q.question.length > 22 ? '…' : ''}`,
        text: `[틀린 문제]\n${describeQuestion(q, i + 1)}`,
      })
    })
  })
  return options
}

/** 최근 대화만 보내서 요청이 너무 커지지 않게 */
const MAX_HISTORY = 20

export const sendChat = (lectureId: string, messages: ChatMessage[], focus: string) =>
  api<{ reply: string }>(`/lectures/${lectureId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ messages: messages.slice(-MAX_HISTORY), focus: focus.slice(0, 10_000) }),
  })
