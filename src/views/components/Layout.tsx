import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from './Button'
import StarBackground from './StarBackground'
import { site } from '../../models/site'
import { isLoggedIn, logout } from '../../models/auth'
import '../styles/layout.css'

// 모든 페이지 공통 틀: 로고(+마이페이지 · 로그아웃) + 제목 영역 + 하단 곡선 영역(children)
// stars를 켜면 반짝이는 별 배경, 끄면 깔끔한 검은 배경
// overlay를 넘기면 화면 오른쪽 아래에 떠 있는 요소(챗봇)를 붙입니다 (절대좌표 없이 grid 겹치기)

interface LayoutProps {
  titleLines: string[]
  subtitle?: string
  stars?: boolean
  overlay?: ReactNode
  children: ReactNode
}

export default function Layout({ titleLines, subtitle, stars = false, overlay, children }: LayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const page = (
    <div className="page">
      <header className="page__header">
        <Link to="/" className="page__brand">
          {site.brand}
        </Link>
        {isLoggedIn() && (
          <nav className="page__nav">
            <Button to="/mypage" variant="text" className="page__logout">
              {site.myPageLabel}
            </Button>
            <Button variant="text" className="page__logout" onClick={handleLogout}>
              {site.logoutLabel}
            </Button>
          </nav>
        )}
      </header>

      <section className="page__hero">
        <h1 className="page__title">
          {titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        {subtitle && <p className="page__subtitle">{subtitle}</p>}
      </section>

      <section className="page__surface">{children}</section>
    </div>
  )

  // overlay(챗봇 등)는 페이지와 같은 grid 칸에 겹쳐서 오른쪽 아래에 붙임 (position 없이)
  const body = overlay ? (
    <div className="shell">
      <div className="shell__scroll">{page}</div>
      <div className="shell__overlay">{overlay}</div>
    </div>
  ) : (
    page
  )

  return stars ? <StarBackground>{body}</StarBackground> : <div className="star-bg">{body}</div>
}
