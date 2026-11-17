// 모든 페이지에서 같이 쓰는 값

export const site = {
  brand: 'Study On ai',
  logoutLabel: '로그아웃',
  myPageLabel: '마이페이지',
}

export interface StarLayer {
  /** 타일 하나에 들어가는 별 개수 */
  count: number
  minSize: number
  maxSize: number
  /** 별 패턴이 반복되는 타일 크기(px) */
  tile: number
  /** 한 번 반짝이는 데 걸리는 시간(초) */
  twinkle: number
  /** 반짝이기 시작하는 시점(초). 레이어마다 다르게 줘서 별이 따로 반짝이게 */
  delay: number
  seed: number
}

// 레이어마다 반짝이는 속도와 시점이 달라서 별들이 제각각 반짝입니다.
export const starLayers: StarLayer[] = [
  { count: 30, minSize: 0.6, maxSize: 1.2, tile: 360, twinkle: 4.2, delay: 0, seed: 7 },
  { count: 18, minSize: 1, maxSize: 1.6, tile: 420, twinkle: 3.1, delay: 1.2, seed: 21 },
  { count: 12, minSize: 1.4, maxSize: 2.2, tile: 520, twinkle: 2.6, delay: 0.6, seed: 42 },
  { count: 6, minSize: 2, maxSize: 2.8, tile: 640, twinkle: 3.6, delay: 2, seed: 99 },
]
