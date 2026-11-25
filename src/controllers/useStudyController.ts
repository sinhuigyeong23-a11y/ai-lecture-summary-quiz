import { useEffect, useState, type DragEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { errorMessage } from '../models/api'
import { isLoggedIn } from '../models/auth'
import { createLecture, studyPageContent } from '../models/study'

// 자료 올리기: 파일 · 글 입력, 올리면 학습 공간으로 이동 (로그인 필요)
export function useStudyController() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true, state: { from: '/study' } })
    }
  }, [navigate])

  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) setFile(dropped)
    },
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file && !text.trim()) return setMessage(studyPageContent.messages.noInput)

    setLoading(true)
    setMessage('')
    try {
      const lecture = await createLecture(file, text)
      navigate(`/lectures/${lecture.id}`)
    } catch (err) {
      setMessage(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return { file, setFile, text, setText, dragging, dropHandlers, message, loading, handleSubmit }
}
