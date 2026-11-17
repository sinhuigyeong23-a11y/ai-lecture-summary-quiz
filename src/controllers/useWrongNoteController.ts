import { useEffect, useRef, useState } from 'react'
import { useEditor, type JSONContent } from '@tiptap/react'
import { buildWrongNoteDoc, saveWrongNote, wrongNoteDoc, wrongNoteExtensions } from '../models/wrongNote'
import type { WrongNoteFile } from '../models/study'

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

/** 입력을 멈추고 이만큼 지나면 자동 저장 */
const SAVE_DELAY = 800

// 오답노트 파일 1개의 직접 꾸미는 노트: 편집기 만들기 · 자동 저장 · 담긴 문제로 다시 만들기
export function useWrongNoteController(lectureId: number, note: WrongNoteFile, onSaved: (noteId: number, json: string) => void) {
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [confirmReload, setConfirmReload] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const save = (doc: JSONContent) => {
    window.clearTimeout(timer.current)
    setSaveState('saving')
    timer.current = window.setTimeout(() => {
      saveWrongNote(String(lectureId), note.id, doc)
        .then(() => {
          setSaveState('saved')
          onSaved(note.id, JSON.stringify(doc))
        })
        .catch(() => setSaveState('failed'))
    }, SAVE_DELAY)
  }

  const editor = useEditor({
    extensions: wrongNoteExtensions,
    content: wrongNoteDoc(note),
    shouldRerenderOnTransaction: true, // 툴바의 선택 상태(굵게 등)를 바로 보여주기 위해
    onUpdate: ({ editor }) => save(editor.getJSON()),
  })

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /** 첫 번째 클릭은 확인 문구만, 두 번째 클릭에 담긴 문제로 노트를 다시 만듦 */
  const reload = () => {
    if (!confirmReload) {
      setConfirmReload(true)
      return
    }
    setConfirmReload(false)
    editor?.commands.setContent(buildWrongNoteDoc(note), { emitUpdate: true })
  }

  return { editor, saveState, reload, confirmReload }
}
