import { Link } from 'react-router'
import Button from '../components/Button'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { formatDate, studyPageContent as content } from '../../models/study'
import { useStudyController } from '../../controllers/useStudyController'
import './StudyPage.css'

// 자료 올리기 화면: 파일 올리기 / 붙여넣기 → 학습 공간으로 이동
export default function StudyPage() {
  const { file, setFile, text, setText, dragging, dropHandlers, message, loading, history, handleSubmit } =
    useStudyController()

  return (
    <Layout titleLines={content.titleLines} subtitle={content.subtitle}>
      <form className="page__form page__form--wide" onSubmit={handleSubmit}>
        <label className={`dropzone ${dragging ? 'is-dragging' : ''}`} {...dropHandlers}>
          <input
            type="file"
            accept={content.upload.accept}
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="dropzone__title">{file ? file.name : content.upload.label}</span>
          <span className="dropzone__hint">{content.upload.hint}</span>
        </label>

        <Field
          multiline
          name={content.text.name}
          label={content.text.label}
          placeholder={content.text.placeholder}
          value={text}
          onChange={(_, value) => setText(value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? content.loadingLabel : content.submitLabel}
        </Button>
        {message && (
          <p className="page__message" role="status">
            {message}
          </p>
        )}
      </form>

      {history.length > 0 && (
        <div className="page__form page__form--wide field">
          <span className="field__label">{content.historyLabel}</span>
          <ul className="history">
            {history.map((item) => (
              <li key={item.id}>
                <Link to={`/lectures/${item.id}`} className="history__item">
                  <span className="history__title">{item.title}</span>
                  <span className="history__date">{formatDate(item.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  )
}
