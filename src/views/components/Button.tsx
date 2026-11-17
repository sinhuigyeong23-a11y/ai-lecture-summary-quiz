import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

// 공통 버튼. to가 있으면 페이지 이동 링크, 없으면 일반 버튼입니다.
// primary: 파란 둥근 버튼 / text: 글자 링크 / chip: 선택형 작은 버튼
type Variant = 'primary' | 'text' | 'chip'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  to?: string
  /** chip 선택 상태 */
  active?: boolean
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  to,
  active,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, active ? 'is-active' : '', className].filter(Boolean).join(' ')

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={cls} aria-pressed={variant === 'chip' ? active : undefined} {...rest}>
      {children}
    </button>
  )
}
