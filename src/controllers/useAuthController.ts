import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { errorMessage } from '../models/api'
import { authMessages, emptyAuthValues, requestAuth, validateAuth, type AuthMode } from '../models/auth'

// 로그인 · 회원가입 입력값 관리와 제출 처리
export function useAuthController(mode: AuthMode) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [values, setValues] = useState(() => emptyAuthValues(mode))
  // 로그인 만료로 넘어온 경우 안내부터 보여줌
  const [message, setMessage] = useState(() => (params.get('expired') ? authMessages.expired : ''))
  const [loading, setLoading] = useState(false)

  const handleChange = (name: string, value: string) => setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const invalid = validateAuth(mode, values)
    if (invalid) return setMessage(invalid)

    setLoading(true)
    setMessage('')
    try {
      await requestAuth(mode, values)
      // 로그인 전에 가려던 페이지가 있으면 그쪽으로, 없으면 학습 시작으로
      const redirect = params.get('from')
      const from =
        (location.state as { from?: string } | null)?.from ??
        (redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/study')
      navigate(from, { replace: true })
    } catch (err) {
      setMessage(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return { values, message, loading, handleChange, handleSubmit }
}
