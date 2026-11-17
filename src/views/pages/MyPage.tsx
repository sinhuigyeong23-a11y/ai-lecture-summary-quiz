import Button from '../components/Button'
import Dialog from '../components/Dialog'
import Layout from '../components/Layout'
import { fileFilters, myPageContent as content, openInWorkspace } from '../../models/myPage'
import { useMyPageController } from '../../controllers/useMyPageController'
import './StudyPage.css'

// 마이페이지: 학습 통계 + 내 학습 파일(요약본 · 시험지 · 오답노트) → 눌러서 내용 보기 · PDF로 내보내기
export default function MyPage() {
  const page = useMyPageController()

  return (
    <Layout titleLines={content.titleLines} subtitle={page.user ? content.subtitle(page.user.name) : content.loading}>
      <div className="page__form page__form--full">
        <div className="page__back">
          <Button variant="chip" onClick={page.goBack}>
            ← {content.backLabel}
          </Button>
        </div>

        <div className="stats">
          {page.stats.map((s) => (
            <div key={s.label} className="stats__item">
              <span className="stats__value">{s.value}</span>
              <span className="stats__label">{s.label}</span>
            </div>
          ))}
        </div>

        <section className="card">
          <div className="view__head">
            <h2 className="card__title">{content.filesTitle}</h2>
            <div className="chips">
              {fileFilters.map((f) => (
                <Button key={f.id} variant="chip" className="tool" active={page.filter === f.id} onClick={() => page.setFilter(f.id)}>
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {page.isEmpty && (
            <div className="card__empty">
              <p>{content.empty}</p>
              <Button to="/study">{content.startLabel}</Button>
            </div>
          )}
          {page.loaded && !page.isEmpty && page.files.length === 0 && <p className="card__empty">{content.noFiles}</p>}

          <ul className="files">
            {page.files.map((f) => (
              <li key={f.key} className="file-row">
                <button type="button" className="file" onClick={() => page.open(f)}>
                  <span className="file__icon" aria-hidden="true">{f.icon}</span>
                  <span className="file__text">
                    <span className="file__name">{f.name}</span>
                    <span className="file__lecture">{f.lecture.title}</span>
                  </span>
                  <span className="file__info">{f.info}</span>
                </button>
                <div className="file-row__actions">
                  <Button
                    variant="text"
                    className={`home__upload ${page.confirmKey === f.key ? 'is-danger' : ''}`}
                    onClick={() => page.remove(f)}
                    disabled={page.removing}
                  >
                    {page.confirmKey === f.key ? content.removeConfirm : content.remove}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {page.confirmKey?.includes('-quiz-') && <p className="decorate__label">{content.removeHint}</p>}
          {!page.opened && page.error && <p className="page__message">{page.error}</p>}
        </section>
      </div>

      <Dialog
        open={page.opened !== null}
        title={page.opened ? `${page.opened.name} · ${page.opened.lecture.title}` : ''}
        onClose={page.close}
        wide
        footer={
          <>
            {page.opened && (
              <Button to={openInWorkspace(page.opened)} variant="text" className="home__upload">
                {content.openLecture}
              </Button>
            )}
            <Button variant="text" onClick={page.close} disabled={page.exporting}>
              {content.close}
            </Button>
            <Button onClick={page.exportPdf} disabled={page.exporting}>
              {page.exporting ? content.exporting : content.exportPdf}
            </Button>
          </>
        }
      >
        <div className="preview" ref={page.previewRef} />
        {page.opened && page.error && <p className="page__message">{page.error}</p>}
      </Dialog>
    </Layout>
  )
}
