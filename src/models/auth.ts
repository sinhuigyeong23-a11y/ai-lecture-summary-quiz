// [Model] 로그인 · 회원가입 콘텐츠 · 입력 검사. 두 화면은 같은 AuthPage를 쓰고 이 설정만 다릅니다.

import { api, tokenStore } from './api'

export type AuthMode = 'login' | 'signup'

export interface AuthField {
  name: string
  label: string
  type: string
  placeholder: string
  autoComplete: string
}

interface AuthContent {
  titleLines: string[]
  subtitle: string
  fields: AuthField[]
  submitLabel: string
  switchLink: { question: string; label: string; to: string }
}

const email: AuthField = {
  name: 'email',
  label: '이메일',
  type: 'email',
  placeholder: 'example@email.com',
  autoComplete: 'email',
}

export const authContent: Record<AuthMode, AuthContent> = {
  login: {
    titleLines: ['다시 만나서 반가워요'],
    subtitle: '로그인하고 이어서 공부해보세요',
    fields: [
      email,
      { name: 'password', label: '비밀번호', type: 'password', placeholder: '비밀번호', autoComplete: 'current-password' },
    ],
    submitLabel: '로그인',
    switchLink: { question: '계정이 없으신가요?', label: '회원가입', to: '/signup' },
  },
  signup: {
    titleLines: ['Study On ai와', '함께 시작해요'],
    subtitle: '간단한 정보만 입력하면 바로 시작할 수 있어요',
    fields: [
      { name: 'name', label: '이름', type: 'text', placeholder: '이름', autoComplete: 'name' },
      email,
      { name: 'password', label: '비밀번호', type: 'password', placeholder: '8자 이상', autoComplete: 'new-password' },
      {
        name: 'passwordConfirm',
        label: '비밀번호 확인',
        type: 'password',
        placeholder: '비밀번호를 한 번 더 입력',
        autoComplete: 'new-password',
      },
    ],
    submitLabel: '회원가입',
    switchLink: { question: '이미 계정이 있으신가요?', label: '로그인', to: '/login' },
  },
}

export const authMessages = {
  empty: '모든 항목을 입력해주세요.',
  shortPassword: '비밀번호는 8자 이상이어야 해요.',
  mismatch: '비밀번호가 서로 달라요.',
  expired: '로그인 시간이 만료됐어요. 다시 로그인해주세요.',
}

export const authLoadingLabel = '잠시만요…'

export interface User {
  id: number
  name: string
  email: string
  /** 오답노트 꾸미기 설정 (값이 비어 있을 수 있음) */
  noteStyle?: { font: string | null; size: string | null; paper: string | null; color: string | null }
}

interface AuthResponse {
  token: string
  user: User
}

/** 로그인 / 회원가입 요청 후 토큰 저장 */
export async function requestAuth(mode: AuthMode, values: AuthValues): Promise<User> {
  const body =
    mode === 'login'
      ? { email: values.email, password: values.password }
      : { name: values.name, email: values.email, password: values.password }
  const res = await api<AuthResponse>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) })
  tokenStore.set(res.token)
  return res.user
}

/** 로그인한 내 정보 */
export const fetchMe = () => api<User>('/auth/me')

export const isLoggedIn = () => tokenStore.get() !== null
export const logout = () => tokenStore.clear()

export type AuthValues = Record<string, string>

export const emptyAuthValues = (mode: AuthMode): AuthValues =>
  Object.fromEntries(authContent[mode].fields.map((f) => [f.name, '']))

/** 입력 검사. 문제가 없으면 빈 문자열 */
export function validateAuth(mode: AuthMode, values: AuthValues) {
  if (Object.values(values).some((v) => !v.trim())) return authMessages.empty
  if (mode === 'signup') {
    if (values.password.length < 8) return authMessages.shortPassword
    if (values.password !== values.passwordConfirm) return authMessages.mismatch
  }
  return ''
}
