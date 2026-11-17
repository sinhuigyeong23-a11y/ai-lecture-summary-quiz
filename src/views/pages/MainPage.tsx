import Button from '../components/Button'
import Layout from '../components/Layout'
import { mainPageContent as content } from '../../models/mainPage'

export default function MainPage() {
  return (
    <Layout stars titleLines={content.titleLines} subtitle={content.subtitle}>
      <p className="page__text">{content.description}</p>
      <Button to={content.cta.to}>{content.cta.label}</Button>
      <p className="page__note">
        {content.login.question}
        <Button variant="text" to={content.login.to}>
          {content.login.label}
        </Button>
      </p>
    </Layout>
  )
}
