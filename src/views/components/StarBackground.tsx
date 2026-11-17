import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { starLayers, type StarLayer } from '../../models/site'

// 반짝이는 별 배경.
// 별 레이어를 position 없이 div 중첩(flex)으로 쌓고, 레이어마다 --twinkle 값(별 밝기)을
// 서로 다른 속도 · 시점으로 바꿔서 별이 제각각 반짝이게 합니다.

interface StarBackgroundProps {
  children: ReactNode
  layers?: StarLayer[]
}

function random(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function layerStyle({ count, minSize, maxSize, tile, twinkle, delay, seed }: StarLayer): CSSProperties {
  const rand = random(seed)
  const stars = Array.from({ length: count }, () => {
    const x = (rand() * 100).toFixed(2)
    const y = (rand() * 100).toFixed(2)
    const size = (minSize + rand() * (maxSize - minSize)).toFixed(2)
    const alpha = (0.5 + rand() * 0.5).toFixed(2)
    return `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,calc(var(--twinkle) * ${alpha})) 99%, transparent 100%)`
  })

  return {
    backgroundImage: stars.join(','),
    backgroundSize: `${tile}px ${tile}px`,
    animationDuration: `${twinkle}s`,
    animationDelay: `-${delay}s`,
  }
}

export default function StarBackground({ children, layers = starLayers }: StarBackgroundProps) {
  const styles = useMemo(() => layers.map(layerStyle), [layers])

  // 마지막 레이어부터 안쪽으로 감싸서 중첩 구조를 만듭니다.
  return styles.reduceRight<ReactNode>(
    (inner, style, i) => (
      <div className={i === 0 ? 'star-bg star-layer' : 'star-layer'} style={style}>
        {inner}
      </div>
    ),
    children,
  )
}
