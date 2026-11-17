import Button from '../components/Button'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { authContent, authLoadingLabel, type AuthMode } from '../../models/auth'
import { useAuthController } from '../../controllers/useAuthController'

// 로그인 · 회원가입 공용 화면. mode에 따라 models/auth.ts의 설정만 바뀝니다.
export default function AuthPage({ mode }: { mode: AuthMode }) {
  const content = authContent[mode]
  const { values, message, loading, handleChange, handleSubmit } = useAuthController(mode)

  return (
    <Layout titleLines={content.titleLines} subtitle={content.subtitle}>
      <form className="page__form" onSubmit={handleSubmit} noValidate>
        {content.fields.map((field) => (
          <Field key={field.name} {...field} value={values[field.name]} onChange={handleChange} />
        ))}
        <Button type="submit" disabled={loading}>
          {loading ? authLoadingLabel : content.submitLabel}
        </Button>
        {message && (
          <p className="page__message" role="status">
            {message}
          </p>
        )}
      </form>
      <p className="page__note">
        {content.switchLink.question}
        <Button variant="text" to={content.switchLink.to}>
          {content.switchLink.label}
        </Button>
      </p>
    </Layout>
  )
}
