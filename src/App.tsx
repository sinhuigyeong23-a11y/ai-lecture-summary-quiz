import { Route, Routes } from 'react-router'
import MainPage from './views/pages/MainPage'
import AuthPage from './views/pages/AuthPage'
import StudyPage from './views/pages/StudyPage'
import ResultPage from './views/pages/ResultPage'
import MyPage from './views/pages/MyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/study" element={<StudyPage />} />
      <Route path="/lectures/:id" element={<ResultPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
    </Routes>
  )
}
