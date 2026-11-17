// [Model] 백엔드 API 공통 호출 · 로그인 토큰 보관

const TOKEN_KEY = 'studyon.token'

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* 저장 불가 환경이면 무시 */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* 무시 */
    }
  },
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  let res: Response
  try {
    res = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해주세요.')
  }

  if (res.status === 401) tokenStore.clear()
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null
    const fallback = res.status === 401 ? '다시 로그인해주세요.' : '요청에 실패했어요. 잠시 후 다시 시도해주세요.'
    throw new ApiError(res.status, data?.message ?? fallback)
  }
  if (res.status === 204) return undefined as T // 응답 내용이 없는 요청 (저장 등)
  return (await res.json()) as T
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : '알 수 없는 오류가 발생했어요.')
