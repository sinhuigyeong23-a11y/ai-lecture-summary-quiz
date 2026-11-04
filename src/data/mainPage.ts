// 메인페이지 콘텐츠. 문구를 바꿀 때는 이 파일만 수정하면 됩니다.

export interface MainPageContent {
  brand: string
  /** 줄 단위 제목 */
  titleLines: string[]
  subtitle: string
  description: string
  cta: { label: string; href: string }
  login: { question: string; label: string; href: string }
}

export const mainPageContent: MainPageContent = {
  brand: 'Study On ai',
  titleLines: ['AI로 시험공부를', '쉽게 시작해보세요'],
  subtitle: 'Study On과 함께',
  description: '요약 · 복습 은 Study On ai 에게 맡기고, 퀴즈를 생성받아 시험 공부를 해보세요.',
  cta: { label: '학습 시작하기', href: '/start' },
  login: { question: '계정이 있으신가요?', label: '로그인', href: '/login' },
}
