import { useState } from 'react'
import Button from '../components/Button'
import WrongNoteSection from './WrongNoteSection'
import {
  correctAnswer,
  formatDate,
  isAnswered,
  myAnswer,
  parseNote,
  quizSetLabel,
  summaryDetail,
  summarySections,
  workspaceContent as content,
  type Lecture,
  type Quiz,
  type QuizSet,
  type WrongNoteFile,
} from '../../models/study'
import type { useLectureController } from '../../controllers/useLectureController'
import type { useNoteStyleController } from '../../controllers/useNoteStyleController'

// 학습 공간 오른쪽 화면들: 요약 / 퀴즈 시험지 / 오답노트

type Ctrl = ReturnType<typeof useLectureController>

/** AI가 쓴 마크다운을 제목 / 글머리표 / 문단으로 */
export function Note({ markdown }: { markdown: string }) {
  return (
    <div className="note">
      {parseNote(markdown).map((block, i) => {
        if (block.type === 'heading') return <h3 key={i} className="note__heading">{block.text}</h3>
        if (block.type === 'item') return <p key={i} className="note__item">{block.text}</p>
        return <p key={i}>{block.text}</p>
      })}
    </div>
  )
}

// ---- 요약 ----

export function SummaryView({ lecture, ctrl }: { lecture: Lecture; ctrl: Ctrl }) {
  const d = summaryDetail(lecture)
  const title = (id: string) => summarySections.find((s) => s.id === id)?.title
  const overview = d.overview ?? lecture.summary

  return (
    <div className="summary">
      <div className="view__head">
        <Button variant="chip" onClick={() => { ctrl.openDialog('summary'); ctrl.setRefresh(true) }}>
          {content.summary.remake}
        </Button>
      </div>

      {overview && (
        <section className="summary__block">
          <h3 className="summary__title">{title('overview')}</h3>
          <Note markdown={overview} />
        </section>
      )}

      {d.keywords?.length ? (
        <section className="summary__block">
          <h3 className="summary__title">{title('keywords')}</h3>
          <div className="chips">
            {d.keywords.map((k) => (
              <span key={k} className="keyword">#{k}</span>
            ))}
          </div>
        </section>
      ) : null}

      {d.concepts?.length ? (
        <section className="summary__block">
          <h3 className="summary__title">{title('concepts')}</h3>
          <dl className="concepts">
            {d.concepts.map((c) => (
              <div key={c.term} className="concepts__item">
                <dt>{c.term}</dt>
                <dd>{c.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {d.easySentences?.length ? (
        <section className="summary__block">
          <h3 className="summary__title">{title('easy')}</h3>
          {d.easySentences.map((e, i) => (
            <div key={i} className="easy">
              <p className="easy__original"><span>{content.summary.easyOriginal}</span>{e.original}</p>
              <p><span>{content.summary.easyPlain}</span>{e.easy}</p>
            </div>
          ))}
        </section>
      ) : null}

      {d.examPoints?.length ? (
        <section className="summary__block summary__block--exam">
          <h3 className="summary__title">{title('exam')}</h3>
          {d.examPoints.map((p, i) => (
            <p key={i} className="note__item">{p}</p>
          ))}
        </section>
      ) : null}

      {lecture.reviewNote && <Note markdown={lecture.reviewNote} />}
    </div>
  )
}

// ---- 퀴즈 시험지 ----

/** 시험지의 문제 1개. 채점 후에는 빨간 펜으로 표시 */
function PaperQuestion({ q, no, revealed, canExport, ctrl }: { q: Quiz; no: number; revealed: boolean; canExport: boolean; ctrl: Ctrl }) {
  const p = content.paper
  const mark = !revealed ? '' : q.correct ? 'is-right' : 'is-wrong'

  return (
    <div className={`paper__q ${mark}`}>
      <p className="paper__question">
        {revealed && <span className="paper__mark" aria-label={q.correct ? '정답' : '오답'}>{q.correct ? '⭕' : '✖'}</span>}
        <span className="paper__no">{no}.</span> {q.question}
        <span className="tag">{p.typeLabel[q.type]}</span>
      </p>

      {q.type === 'short' ? (
        <input
          className={`paper__short ${revealed && !q.correct ? 'is-crossed' : ''}`}
          aria-label={p.shortPlaceholder}
          placeholder={p.shortPlaceholder}
          value={q.selectedText ?? ''}
          maxLength={500}
          disabled={revealed}
          onChange={(e) => ctrl.answer(q, { text: e.target.value })}
          onBlur={() => ctrl.saveShort(q)}
        />
      ) : (
        <div className={`paper__choices ${q.type === 'ox' ? 'paper__choices--ox' : ''}`}>
          {q.choices.map((choice, ci) => {
            const picked = q.selectedIndex === ci
            const answer = revealed && ci === q.answerIndex
            const cls = ['paper__choice', picked ? 'is-picked' : '', answer ? 'is-answer' : '', revealed && picked && !q.correct ? 'is-crossed' : '']
            return (
              <button
                key={ci}
                type="button"
                className={cls.filter(Boolean).join(' ')}
                aria-pressed={picked}
                disabled={revealed}
                onClick={() => ctrl.answer(q, { choiceIndex: ci })}
              >
                {q.type === 'ox' ? choice : `${'①②③④⑤'[ci] ?? ci + 1} ${choice}`}
              </button>
            )
          })}
        </div>
      )}

      {revealed && (
        <div className="paper__red">
          {!q.correct && (
            <p>
              <strong>{p.answerLabel}</strong> {correctAnswer(q)}
              {!isAnswered(q) && ` ${p.notAnswered}`}
            </p>
          )}
          {q.explanation && (
            <p>
              <strong>{p.explanation}</strong> {q.explanation}
            </p>
          )}
        </div>
      )}

      {/* 채점 후: 오답노트에 담을지 고르기 */}
      {revealed && canExport &&
        (q.missed ? (
          <span className="paper__note">{p.inNote}</span>
        ) : (
          <label className="paper__pick">
            <input type="checkbox" checked={ctrl.isPicked(q)} onChange={() => ctrl.togglePick(q)} />
            {p.pick}
          </label>
        ))}
    </div>
  )
}

export function QuizPaper({ set, index, ctrl }: { set: QuizSet; index: number; ctrl: Ctrl }) {
  const p = content.paper
  const left = set.questions.filter((q) => !isAnswered(q)).length
  // 다시 풀기 시험지는 원래 문제가 이미 오답노트에 있어서 내보내기 없음
  const canExport = set.kind !== 'retry'
  const picked = ctrl.pickedIn(set).length

  return (
    <div className="paper">
      <div className="paper__head">
        <span className="paper__name">{quizSetLabel(set, index)}</span>
        {set.revealed && <span className="paper__score">{p.score(set.correctCount, set.questions.length)}</span>}
      </div>

      {set.questions.map((q, i) => (
        <PaperQuestion key={q.id} q={q} no={i + 1} revealed={set.revealed} canExport={canExport} ctrl={ctrl} />
      ))}

      {!set.revealed ? (
        <div className="paper__foot">
          <p className="decorate__label">{left > 0 ? p.unanswered(left) : p.revealHint}</p>
          <Button onClick={() => ctrl.reveal(set.id)} disabled={ctrl.busy === 'reveal'}>
            {p.reveal}
          </Button>
        </div>
      ) : (
        <div className="paper__foot">
          {ctrl.exported ? (
            <p className="paper__done">{p.exported(ctrl.exported.count)}</p>
          ) : (
            <p className="decorate__label">{canExport ? p.exportHint : p.retryHint}</p>
          )}
          <div className="chips">
            {canExport && picked > 0 && (
              <Button onClick={() => ctrl.openExport(set)} disabled={ctrl.busy === 'export'}>
                {p.export(picked)}
              </Button>
            )}
            <Button
              variant="chip"
              onClick={() => (ctrl.exported ? ctrl.openNote(ctrl.exported.noteId) : ctrl.setView({ kind: 'wrong' }))}
            >
              {p.goWrong}
            </Button>
            <Button variant="chip" onClick={() => ctrl.openDialog('quiz')}>
              {p.newQuiz}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- 오답노트 ----

/** 오답노트 파일함: 파일 목록 · 이름 바꾸기 · 삭제 */
export function WrongList({ lecture, ctrl }: { lecture: Lecture; ctrl: Ctrl }) {
  const w = content.wrong
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  if (lecture.wrongNotes.length === 0) return <p className="card__empty">{w.empty}</p>

  const saveTitle = (noteId: number) => {
    if (draft.trim()) ctrl.rename(noteId, draft.trim())
    setEditing(null)
  }

  return (
    <div className="home">
      <h2 className="card__title">{w.listTitle}</h2>
      <p className="decorate__label">{w.listHint}</p>
      <ul className="files">
        {lecture.wrongNotes.map((n) => {
          const open = n.questions.filter((q) => !q.resolved).length
          return (
            <li key={n.id} className="file-row">
              {editing === n.id ? (
                <form
                  className="chat__form file-row__edit"
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveTitle(n.id)
                  }}
                >
                  <input
                    className="field__input"
                    aria-label={w.rename}
                    value={draft}
                    maxLength={100}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <Button type="submit" disabled={!draft.trim()}>{w.save}</Button>
                </form>
              ) : (
                <button type="button" className="file" onClick={() => ctrl.openNote(n.id)}>
                  <span className="file__icon" aria-hidden="true">❌</span>
                  <span className="file__text">
                    <span className="file__name">{n.title}</span>
                    <span className="file__lecture">{formatDate(n.createdAt)}</span>
                  </span>
                  <span className="file__info">{w.count(open, n.questions.length)}</span>
                </button>
              )}
              <div className="file-row__actions">
                <Button
                  variant="text"
                  className="home__upload"
                  onClick={() => {
                    setEditing(n.id)
                    setDraft(n.title)
                    setConfirmDelete(null)
                  }}
                >
                  {w.rename}
                </Button>
                <Button
                  variant="text"
                  className="home__upload"
                  disabled={ctrl.busy === 'note'}
                  onClick={() => (confirmDelete === n.id ? ctrl.remove(n.id) : setConfirmDelete(n.id))}
                >
                  {confirmDelete === n.id ? w.removeConfirm : w.remove}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** 오답노트 파일 1개: AI 분석 · 틀린 문제만 다시 풀기 · 비슷한 문제 + 담긴 문제 + 직접 꾸미는 노트 */
export function WrongView({ lecture, file, ctrl, note }: { lecture: Lecture; file: WrongNoteFile; ctrl: Ctrl; note: ReturnType<typeof useNoteStyleController> }) {
  const [showResolved, setShowResolved] = useState(false)
  const w = content.wrong
  const open = file.questions.filter((q) => !q.resolved)
  const list = showResolved ? file.questions : open

  return (
    <>
      <h2 className="card__title">❌ {file.title}</h2>
      {file.questions.length === 0 && <p className="decorate__label">{w.noQuestions}</p>}
      <div className="view__head">
        <div className="chips">
          <Button variant="chip" onClick={() => ctrl.requestAnalysis(file.id)} disabled={ctrl.busy !== '' || open.length === 0}>
            {ctrl.busy === 'analysis' ? w.analyzing(ctrl.elapsed) : w.analyze}
          </Button>
          <Button variant="chip" onClick={() => ctrl.requestRetry(file.id)} disabled={ctrl.busy !== '' || open.length === 0}>
            {w.retry}
          </Button>
          <Button variant="chip" onClick={() => ctrl.requestSimilar(file.id)} disabled={ctrl.busy !== '' || open.length === 0}>
            {ctrl.busy === 'similar' ? w.making(ctrl.elapsed) : w.similar}
          </Button>
        </div>
        {file.questions.some((q) => q.resolved) && (
          <Button variant="chip" active={showResolved} onClick={() => setShowResolved((v) => !v)}>
            {w.showResolved}
          </Button>
        )}
      </div>

      {list.map((q, i) => (
        <article key={q.id} className={`wrong-card ${q.resolved ? 'is-resolved' : ''}`}>
          <p className="quiz__question">
            <span className="tag">{content.paper.typeLabel[q.type]}</span> {i + 1}. {q.question}
          </p>
          {q.resolved && <p className="wrong-card__resolved">{w.resolved}</p>}
          <p className="wrong-card__mine">{w.mine}: {myAnswer(q) || content.paper.notAnswered}</p>
          <p className="wrong-card__answer">{w.answer}: {correctAnswer(q)}</p>
          {q.analysis ? (
            <div className="analysis">
              <p><strong>{w.reason}</strong> {q.analysis.reason}</p>
              <p><strong>{w.detail}</strong> {q.analysis.detail}</p>
              <div><strong>{w.concept}</strong><Note markdown={q.analysis.concept} /></div>
            </div>
          ) : (
            <>
              {q.explanation && <p className="quiz__feedback">{q.explanation}</p>}
              <p className="decorate__label">{w.noAnalysis}</p>
            </>
          )}
        </article>
      ))}

      <h3 className="summary__title">{w.myNote}</h3>
      <WrongNoteSection key={file.id} lectureId={lecture.id} file={file} note={note} onSaved={ctrl.setNoteContent} />
    </>
  )
}
