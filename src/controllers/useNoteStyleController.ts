import { useEffect, useState } from 'react'
import { errorMessage } from '../models/api'
import { fetchMe } from '../models/auth'
import {
  defaultNoteStyle,
  loadNoteFonts,
  normalizeNoteStyle,
  resolveNoteStyle,
  saveNoteStyle,
  type NoteStyle,
} from '../models/noteStyle'

// 오답노트 꾸미기: 내 설정 불러오기 · 바꾸면 바로 적용하고 서버에 저장
export function useNoteStyleController() {
  const [style, setStyle] = useState<NoteStyle>(defaultNoteStyle)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNoteFonts()
    fetchMe()
      .then((me) => setStyle(normalizeNoteStyle(me.noteStyle)))
      .catch(() => setStyle(defaultNoteStyle))
  }, [])

  const change = (key: keyof NoteStyle, value: string) => {
    const next = { ...style, [key]: value }
    setStyle(next)
    setError('')
    saveNoteStyle(next).catch((err) => setError(errorMessage(err)))
  }

  return {
    style,
    resolved: resolveNoteStyle(style),
    editing,
    toggleEditing: () => setEditing((v) => !v),
    change,
    error,
  }
}
