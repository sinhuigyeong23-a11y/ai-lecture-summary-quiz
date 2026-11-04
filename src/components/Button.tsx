import type { AnchorHTMLAttributes, ReactNode } from 'react'

// 공통 버튼. variant로 모양만 바꿔서 모든 페이지에서 같이 씁니다.
type Variant = 'primary' | 'text'

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  children: ReactNode
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <a className={`btn btn--${variant} ${className}`.trim()} {...rest}>
      {children}
    </a>
  )
}
