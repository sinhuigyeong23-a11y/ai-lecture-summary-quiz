import { useParams } from 'react-router'
import Button from '../components/Button'
import Dialog from '../components/Dialog'
import Layout from '../components/Layout'
import ChatWidget from './ChatWidget'
import { QuizPaper, SummaryView, WrongList, WrongView } from './StudyViews'
import { hasSummary, quizWizard, summarySections, workspaceContent as content } from '../../models/study'
import { useLectureController } from '../../controllers/useLectureController'
import { useChatController } from '../../controllers/useChatController'
import { useNoteStyleController } from '../../controllers/useNoteStyleController'
import './StudyPage.css'

// 학습 공간: 처음 화면(요약 · 퀴즈 생성 · 오답노트 · 내 시험지) → 각 화면, 오른쪽 아래 AI 튜터 챗봇
// 요약 · 퀴즈는 버튼을 누르면 가운데 뜨는 창에서 항목을 골라 만듭니다.

export default function ResultPage() {
  const { id = '' } = useParams()
  const ctrl = useLectureController(id)
  const chat = useChatController(id, ctrl.lecture)
  const note = useNoteStyleController()
  const { lecture, view } = ctrl
  const m = content.menu
  const d = content.dialog

  if (!lecture) {
    return (
      <Layout titleLines={[ctrl.error ? '앗!' : content.loading]}>
        {ctrl.error && <p className="page__message">{ctrl.error}</p>}
        <Button to="/study">{m.upload}</Button>
      </Layout>
    )
  }

  const noteCount = lecture.wrongNotes.length
  const currentSet = view.kind === 'quiz' ? lecture.quizSets.findIndex((s) => s.id === view.setId) : -1
  const currentNote = view.kind === 'wrongNote' ? lecture.wrongNotes.find((n) => n.id === view.noteId) : undefined
  const goSummary = () => (hasSummary(lecture) ? ctrl.setView({ kind: 'summary' }) : ctrl.openDialog('summary'))
  const e = content.exportDialog
  const exportSet = currentSet >= 0 ? lecture.quizSets[currentSet] : undefined

  // 처음 화면: 무엇부터 할지 (내 시험지 목록은 마이페이지에서)
  const home = (
    <div className="home">
      <h2 className="card__title">{content.welcome.title}</h2>
      <p className="decorate__label">{content.welcome.text}</p>
      <div className="home__actions">
        <Button variant="chip" className="option" onClick={goSummary}>
          <strong>{m.summary}</strong>
          <span>{hasSummary(lecture) ? '만든 요약 보기' : '요약 만들기'}</span>
        </Button>
        <Button variant="chip" className="option" onClick={() => ctrl.openDialog('quiz')}>
          <strong>{m.quiz}</strong>
          <span>유형 · 난이도 · 개수 골라서</span>
        </Button>
        <Button variant="chip" className="option" onClick={() => ctrl.setView({ kind: 'wrong' })}>
          <strong>{m.wrong}</strong>
          <span>{noteCount > 0 ? `오답노트 파일 ${noteCount}개` : '틀린 문제 모아보기'}</span>
        </Button>
      </div>

      <div className="page__actions">
        <Button to="/study" variant="text" className="home__upload">
          {m.upload}
        </Button>
      </div>
    </div>
  )

  // 퀴즈 만들기 창: 단계별 (유형 → 난이도 → 개수)
  const lastStep = quizWizard.steps.length - 1
  const quizDialog = (
    <Dialog
      open={ctrl.dialog === 'quiz'}
      title={d.quizTitle}
      onClose={ctrl.closeDialog}
      footer={
        <>
          <Button variant="text" onClick={ctrl.step === 0 ? ctrl.closeDialog : () => ctrl.setStep(ctrl.step - 1)} disabled={ctrl.busy === 'make'}>
            {ctrl.step === 0 ? d.cancel : d.prev}
          </Button>
          {ctrl.step < lastStep ? (
            <Button onClick={() => ctrl.setStep(ctrl.step + 1)} disabled={ctrl.step === 0 && ctrl.types.length === 0}>
              {d.next}
            </Button>
          ) : (
            <Button onClick={ctrl.submitQuiz} disabled={ctrl.busy === 'make'}>
              {ctrl.busy === 'make' ? d.making(ctrl.elapsed) : d.quizSubmit}
            </Button>
          )}
        </>
      }
    >
      <ol className="steps">
        {quizWizard.steps.map((s, i) => (
          <li key={s} className={i === ctrl.step ? 'is-current' : i < ctrl.step ? 'is-done' : ''}>
            {s}
          </li>
        ))}
      </ol>
      <p className="decorate__label">{d.quizHints[ctrl.step]}</p>

      <div className="options-grid">
        {ctrl.step === 0 &&
          quizWizard.types.map((t) => (
            <Button key={t.id} variant="chip" className="option" active={ctrl.types.includes(t.id)} onClick={() => ctrl.toggleType(t.id)}>
              <strong>{ctrl.types.includes(t.id) ? `✓ ${t.label}` : t.label}</strong>
              <span>{t.desc}</span>
            </Button>
          ))}
        {ctrl.step === 1 &&
          quizWizard.difficulties.map((t) => (
            <Button key={t.id} variant="chip" className="option" active={ctrl.difficulty === t.id} onClick={() => ctrl.setDifficulty(t.id)}>
              <strong>{t.label}</strong>
              <span>{t.desc}</span>
            </Button>
          ))}
        {ctrl.step === 2 &&
          quizWizard.counts.map((n) => (
            <Button key={n} variant="chip" className="option" active={ctrl.count === n} onClick={() => ctrl.setCount(n)}>
              <strong>{n}문제</strong>
            </Button>
          ))}
      </div>
      {ctrl.dialog === 'quiz' && ctrl.error && <p className="page__message">{ctrl.error}</p>}
    </Dialog>
  )

  const summaryDialog = (
    <Dialog
      open={ctrl.dialog === 'summary'}
      title={d.summaryTitle}
      onClose={ctrl.closeDialog}
      footer={
        <>
          <Button variant="text" onClick={ctrl.closeDialog} disabled={ctrl.busy === 'make'}>
            {d.cancel}
          </Button>
          <Button onClick={ctrl.submitSummary} disabled={ctrl.busy === 'make' || ctrl.sections.length === 0}>
            {ctrl.busy === 'make' ? d.making(ctrl.elapsed) : d.summarySubmit}
          </Button>
        </>
      }
    >
      <p className="decorate__label">{d.summaryHint}</p>
      <div className="options-grid options-grid--list">
        {summarySections.map((s) => (
          <Button key={s.id} variant="chip" className="option" active={ctrl.sections.includes(s.id)} onClick={() => ctrl.toggleSection(s.id)}>
            <strong>{ctrl.sections.includes(s.id) ? `✓ ${s.label}` : s.label}</strong>
          </Button>
        ))}
      </div>
      {ctrl.dialog === 'summary' && ctrl.error && <p className="page__message">{ctrl.error}</p>}
    </Dialog>
  )

  // 오답노트로 내보내기 창: 새 파일 (제목 입력) 또는 기존 파일
  const picked = exportSet ? ctrl.pickedIn(exportSet).length : 0
  const exportDialog = (
    <Dialog
      open={ctrl.dialog === 'export'}
      title={e.title}
      onClose={ctrl.closeDialog}
      footer={
        <>
          <Button variant="text" onClick={ctrl.closeDialog} disabled={ctrl.busy === 'export'}>
            {d.cancel}
          </Button>
          <Button
            onClick={() => exportSet && ctrl.submitExport(exportSet)}
            disabled={ctrl.busy === 'export' || !exportSet || (ctrl.exportTarget === 'new' && !ctrl.exportTitle.trim())}
          >
            {e.submit(picked)}
          </Button>
        </>
      }
    >
      <p className="decorate__label">{e.hint}</p>
      <div className="options-grid options-grid--list">
        <Button variant="chip" className="option" active={ctrl.exportTarget === 'new'} onClick={() => ctrl.setExportTarget('new')}>
          <strong>{e.newNote}</strong>
        </Button>
        {ctrl.exportTarget === 'new' && (
          <label className="field">
            <span className="field__label">{e.titleLabel}</span>
            <input
              className="field__input"
              value={ctrl.exportTitle}
              maxLength={100}
              onChange={(ev) => ctrl.setExportTitle(ev.target.value)}
            />
          </label>
        )}
        {lecture.wrongNotes.map((n) => (
          <Button key={n.id} variant="chip" className="option" active={ctrl.exportTarget === n.id} onClick={() => ctrl.setExportTarget(n.id)}>
            <strong>❌ {n.title}</strong>
            <span>문제 {n.questions.length}개</span>
          </Button>
        ))}
      </div>
      {ctrl.dialog === 'export' && ctrl.error && <p className="page__message">{ctrl.error}</p>}
    </Dialog>
  )

  // 위쪽 뒤로가기: 오답노트 파일 안에서는 파일 목록으로, 나머지는 처음 화면으로
  const back =
    view.kind === 'wrongNote' ? (
      <Button variant="chip" onClick={() => ctrl.setView({ kind: 'wrong' })}>
        {content.wrong.backToList}
      </Button>
    ) : (
      <Button variant="chip" onClick={() => ctrl.setView({ kind: 'welcome' })}>
        ← 처음으로
      </Button>
    )

  return (
    <Layout titleLines={[lecture.title]} subtitle={content.subtitle} overlay={<ChatWidget chat={chat} />}>
      <div className="page__form page__form--full">
        <section className="card">
          {view.kind !== 'welcome' && <div className="view__head">{back}</div>}

          {view.kind === 'welcome' && home}
          {view.kind === 'summary' && <SummaryView lecture={lecture} ctrl={ctrl} />}
          {view.kind === 'quiz' && currentSet >= 0 && (
            <QuizPaper set={lecture.quizSets[currentSet]} index={currentSet} ctrl={ctrl} />
          )}
          {view.kind === 'wrong' && <WrongList lecture={lecture} ctrl={ctrl} />}
          {view.kind === 'wrongNote' && currentNote && (
            <WrongView lecture={lecture} file={currentNote} ctrl={ctrl} note={note} />
          )}

          {!ctrl.dialog && ctrl.error && <p className="page__message">{ctrl.error}</p>}
        </section>
      </div>

      {summaryDialog}
      {quizDialog}
      {exportDialog}
    </Layout>
  )
}
