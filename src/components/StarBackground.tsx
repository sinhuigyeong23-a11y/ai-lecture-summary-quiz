import { useMemo, type ReactNode } from 'react'

// 별이 뿌려진 우주 배경. Figma의 커스텀 셰이더 채우기를 CSS 그라디언트로 옮긴 것입니다.
// 별은 배경 이미지로만 그리므로 레이아웃은 flex 그대로 유지됩니다.

interface StarBackgroundProps {
  children: ReactNode
  /** 별 개수 */
  count?: number
  /** 같은 seed면 항상 같은 별 배치 */
  seed?: number
}

function random(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function createStars(count: number, seed: number) {
  const rand = random(seed)
  return Array.from({ length: count }, () => {
    const x = (rand() * 100).toFixed(2)
    const y = (rand() * 100).toFixed(2)
    const size = (0.6 + rand() * 1.4).toFixed(2)
    const alpha = (0.35 + rand() * 0.65).toFixed(2)
    return `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${alpha}) 99%, transparent 100%)`
  }).join(',')
}

export default function StarBackground({ children, count = 180, seed = 7 }: StarBackgroundProps) {
  const stars = useMemo(() => createStars(count, seed), [count, seed])

  return (
    <div className="star-bg" style={{ backgroundImage: stars }}>
      {children}
    </div>
  )
}
