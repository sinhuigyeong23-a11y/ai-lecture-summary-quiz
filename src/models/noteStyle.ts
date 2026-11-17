// [Model] 오답노트 꾸미기: 글꼴 · 글자 크기 · 종이 · 펜 색 선택지와 저장 API
// 선택지를 추가하려면 아래 목록에 한 줄만 넣으면 됩니다. (글꼴은 Google Fonts의 한글 글꼴)

import { api } from './api'
import type { User } from './auth'

export interface FontOption {
  id: string
  label: string
  /** Google Fonts 이름 */
  family: string
  /** 손글씨 글꼴은 작게 보여서 크기 보정 */
  scale: number
}

export interface Option {
  id: string
  label: string
}

export interface ColorOption extends Option {
  value: string
}

export const noteFonts: FontOption[] = [
  { id: 'noto-sans', label: '기본', family: 'Noto Sans KR', scale: 1 },
  { id: 'gowun-dodum', label: '고운돋움', family: 'Gowun Dodum', scale: 1 },
  { id: 'nanum-myeongjo', label: '나눔명조', family: 'Nanum Myeongjo', scale: 1 },
  { id: 'nanum-pen', label: '나눔펜', family: 'Nanum Pen Script', scale: 1.35 },
  { id: 'gaegu', label: '개구쟁이', family: 'Gaegu', scale: 1.2 },
  { id: 'hi-melody', label: '하이멜로디', family: 'Hi Melody', scale: 1.25 },
  { id: 'poor-story', label: '푸어스토리', family: 'Poor Story', scale: 1.15 },
  { id: 'gamja-flower', label: '감자꽃', family: 'Gamja Flower', scale: 1.2 },
  { id: 'jua', label: '주아', family: 'Jua', scale: 1.05 },
  { id: 'do-hyeon', label: '도현', family: 'Do Hyeon', scale: 1.05 },
]

export const noteSizes: (Option & { px: number })[] = [
  { id: 'sm', label: '작게', px: 14 },
  { id: 'md', label: '보통', px: 16 },
  { id: 'lg', label: '크게', px: 19 },
]

export const notePapers: Option[] = [
  { id: 'lined', label: '줄노트' },
  { id: 'grid', label: '모눈' },
  { id: 'plain', label: '무지' },
  { id: 'dark', label: '다크' },
]

export const noteColors: ColorOption[] = [
  { id: 'blue', label: '파랑', value: '#3f4fe5' },
  { id: 'red', label: '빨강', value: '#e5484d' },
  { id: 'green', label: '초록', value: '#2f9e6b' },
  { id: 'purple', label: '보라', value: '#8e4ec6' },
  { id: 'orange', label: '주황', value: '#e8590c' },
  { id: 'pink', label: '핑크', value: '#d6336c' },
]

export interface NoteStyle {
  font: string
  size: string
  paper: string
  color: string
}

export const defaultNoteStyle: NoteStyle = { font: 'nanum-pen', size: 'md', paper: 'lined', color: 'blue' }

export const noteStyleContent = {
  toggleLabel: '노트 기본 설정',
  closeLabel: '설정 닫기',
  groups: { font: '기본 글꼴', size: '기본 글자 크기', paper: '종이', color: '제목 색' },
}

const pick = <T extends { id: string }>(list: T[], id: string | null | undefined) =>
  list.find((o) => o.id === id) ?? list[0]

/** 저장된 값 중 지금 목록에 없는 건 기본값으로 */
export function normalizeNoteStyle(saved?: Partial<Record<keyof NoteStyle, string | null>> | null): NoteStyle {
  const s = { ...defaultNoteStyle, ...Object.fromEntries(Object.entries(saved ?? {}).filter(([, v]) => v)) }
  return {
    font: pick(noteFonts, s.font).id,
    size: pick(noteSizes, s.size).id,
    paper: pick(notePapers, s.paper).id,
    color: pick(noteColors, s.color).id,
  }
}

/** 화면 · PDF에 바로 쓸 수 있는 값 */
export function resolveNoteStyle(style: NoteStyle) {
  const font = pick(noteFonts, style.font)
  return {
    fontFamily: `'${font.family}', 'Noto Sans KR', sans-serif`,
    fontSize: Math.round(pick(noteSizes, style.size).px * font.scale),
    paper: pick(notePapers, style.paper).id,
    color: pick(noteColors, style.color).value,
  }
}

/** 고를 수 있는 글꼴을 한 번에 불러오기 (Google Fonts는 실제로 쓰는 글자만 내려받음) */
export function loadNoteFonts() {
  const id = 'note-fonts'
  if (document.getElementById(id)) return
  const families = noteFonts.map((f) => `family=${f.family.replace(/ /g, '+')}`).join('&')
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
  document.head.append(link)
}

export const saveNoteStyle = (style: NoteStyle) =>
  api<User>('/auth/me/note-style', { method: 'PUT', body: JSON.stringify(style) })