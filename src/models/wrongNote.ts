// [Model] 직접 꾸미는 오답노트 (캔바처럼 글자를 골라서 글꼴 · 크기 · 색 · 형광펜을 바꿈)
// 편집기는 TipTap을 쓰고, 문서는 JSON으로 서버에 저장합니다.

import type { Extensions, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { api } from './api'
import { correctAnswer, myAnswer, type WrongNoteFile } from './study'

/** 편집기와 PDF 변환에서 똑같이 쓰는 기능 목록 */
export const wrongNoteExtensions: Extensions = [
  StarterKit.configure({ link: false }),
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
]

/** 툴바 선택지 (글꼴 목록은 noteStyle.ts의 noteFonts를 같이 씀) */
export const toolbarOptions = {
  sizes: ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'],
  textColors: ['#222222', '#e5484d', '#3f4fe5', '#2f9e6b', '#8e4ec6', '#e8590c', '#d6336c', '#868e96'],
  highlights: ['#fff3a3', '#ffd6e7', '#c9f2d0', '#d0e4ff', '#ead6ff', '#ffe0c2'],
}

export const wrongNoteContent = {
  hint: '글자를 드래그해서 고른 다음 위 도구로 글꼴 · 크기 · 색을 바꿔보세요. 자유롭게 써도 돼요!',
  saving: '저장 중…',
  saved: '저장됨',
  failed: '저장 실패',
  reload: '틀린 문제 다시 불러오기',
  reloadConfirm: '지금 쓴 내용이 지워져요. 한 번 더 누르면 다시 불러와요',
  tools: {
    font: '글꼴',
    size: '크기',
    bold: '굵게',
    italic: '기울임',
    underline: '밑줄',
    strike: '취소선',
    textColor: '글자색',
    highlight: '형광펜',
    clear: '지우기',
    heading: '제목',
    bullet: '목록',
    alignLeft: '왼쪽',
    alignCenter: '가운데',
    undo: '되돌리기',
    redo: '다시 실행',
  },
  labels: { mine: '내가 고른 답', answer: '정답', explanation: '해설', reason: '틀린 이유', memo: '✏️ 메모: ' },
}

const text = (value: string, marks?: JSONContent['marks']): JSONContent => ({ type: 'text', text: value, marks })
const paragraph = (...content: JSONContent[]): JSONContent => ({ type: 'paragraph', content })

/** 오답노트 파일에 담긴 문제로 처음 노트 만들기 (이후엔 사용자가 자유롭게 고침) */
export function buildWrongNoteDoc(note: WrongNoteFile): JSONContent {
  const { labels } = wrongNoteContent
  const content: JSONContent[] = []
  note.questions.forEach((q, i) => {
    if (i > 0) content.push({ type: 'horizontalRule' })
    content.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [text(`Q${i + 1}. ${q.question}`)],
    })
    const mine = myAnswer(q)
    if (mine) {
      content.push(
        paragraph(text(`${labels.mine}: `), text(mine, [{ type: 'strike' }, { type: 'textStyle', attrs: { color: '#e5484d' } }])),
      )
    }
    content.push(
      paragraph(
        text(`${labels.answer}: `),
        text(correctAnswer(q) || '-', [{ type: 'bold' }, { type: 'highlight', attrs: { color: '#fff3a3' } }]),
      ),
    )
    content.push(paragraph(text(`${labels.explanation}: ${q.analysis?.detail || q.explanation}`)))
    if (q.analysis) {
      content.push(paragraph(text(`${labels.reason}: `, [{ type: 'bold' }]), text(q.analysis.reason)))
    }
    content.push(paragraph(text(labels.memo, [{ type: 'textStyle', attrs: { color: '#3f4fe5' } }])))
  })
  return { type: 'doc', content }
}

/** 저장된 노트가 있으면 그걸, 없거나 깨졌으면 담긴 문제로 새로 만든 문서 */
export function wrongNoteDoc(note: WrongNoteFile): JSONContent {
  if (note.content) {
    try {
      return JSON.parse(note.content) as JSONContent
    } catch {
      /* 저장본이 깨졌으면 새로 만듦 */
    }
  }
  return buildWrongNoteDoc(note)
}

export const saveWrongNote = (lectureId: string, noteId: number, doc: JSONContent) =>
  api<void>(`/lectures/${lectureId}/wrong-notes/${noteId}/content`, {
    method: 'PUT',
    body: JSON.stringify({ content: JSON.stringify(doc) }),
  })
