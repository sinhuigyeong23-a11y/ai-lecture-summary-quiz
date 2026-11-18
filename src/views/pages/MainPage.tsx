import Button from '../components/Button'
import Layout from '../components/Layout'
import { mainPageContent as content } from '../../models/mainPage'
import { isLoggedIn } from '../../models/auth'

export default function MainPage() {
  return (
    <Layout stars titleLines={content.titleLines} subtitle={content.subtitle}>
      <p className="page__text">{content.description}</p>
      <Button to={content.cta.to}>{content.cta.label}</Button>
      {/* 로그인 안 했을 때만 로그인 안내 */}
      {!isLoggedIn() && (
        <p className="page__note">
          {content.login.question}
          <Button variant="text" to={content.login.to}>
            {content.login.label}
          </Button>
        </p>
      )}
    </Layout>
  )
}
