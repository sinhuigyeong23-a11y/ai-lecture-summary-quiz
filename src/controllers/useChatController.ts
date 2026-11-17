import { useEffect, useRef, useState, type FormEvent } from 'react'
import { errorMessage } from '../models/api'
import { chatFocusOptions, sendChat, type ChatMessage } from '../models/chat'
import type { Lecture } from '../models/study'

// AI 튜터 챗봇: 열기/닫기 · 물어볼 대상 고르기 · 대화 · 전송
export function useChatController(lectureId: string, lecture: Lecture | null) {
  const [open, setOpen] = useState(false)
  const [focusId, setFocusId] = useState('all')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  const focusOptions = lecture ? chatFocusOptions(lecture) : []
  const focus = focusOptions.find((f) => f.id === focusId) ?? focusOptions[0]

  // 새 메시지가 오면 대화창 맨 아래로
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, loading, open])

  const ask = async (question: string) => {
    const content = question.trim()
    if (!content || loading) return

    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setError('')
    setLoading(true)
    try {
      const { reply } = await sendChat(lectureId, next, focus?.text ?? '')
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  return {
    open,
    toggle: () => setOpen((v) => !v),
    focusOptions,
    focusId: focus?.id ?? 'all',
    setFocusId,
    messages,
    input,
    setInput,
    loading,
    error,
    ask,
    handleSubmit,
    logRef,
  }
}
