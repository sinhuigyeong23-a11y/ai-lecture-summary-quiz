import Button from '../components/Button'
import { chatContent as text } from '../../models/chat'
import type { useChatController } from '../../controllers/useChatController'

// 오른쪽 아래 AI 튜터: 작은 캐릭터를 누르면 대화창이 열림
// (Layout의 overlay 칸에 들어가서 페이지 위에 겹쳐 보임 · 절대좌표 없이 grid 겹치기)

/** 챗봇 캐릭터 (작은 로봇 얼굴) */
function Mascot() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
      <line x1="32" y1="6" x2="32" y2="14" stroke="#c9ceff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="6" r="4" fill="#ffd166" />
      <rect x="8" y="14" width="48" height="40" rx="16" fill="#3f4fe5" />
      <rect x="14" y="22" width="36" height="22" rx="11" fill="#eef0ff" />
      <circle className="mascot__eye" cx="25" cy="33" r="4" fill="#1d1d3a" />
      <circle className="mascot__eye" cx="39" cy="33" r="4" fill="#1d1d3a" />
      <path d="M27 40 Q32 44 37 40" stroke="#1d1d3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="40" r="3" fill="#ffb3c7" opacity="0.8" />
      <circle cx="46" cy="40" r="3" fill="#ffb3c7" opacity="0.8" />
    </svg>
  )
}

export default function ChatWidget({ chat }: { chat: ReturnType<typeof useChatController> }) {
  return (
    <div className="chatbot">
      {chat.open && (
        <section className="chatbot__panel" aria-label={text.title}>
          <header className="chatbot__head">
            <span className="chatbot__avatar">
              <Mascot />
            </span>
            <strong>{text.title}</strong>
            <Button variant="text" onClick={chat.toggle}>
              {text.close}
            </Button>
          </header>

          <label className="chatbot__focus">
            <span className="decorate__label">{text.focusLabel}</span>
            <select className="toolbar__select" value={chat.focusId} onChange={(e) => chat.setFocusId(e.target.value)}>
              {chat.focusOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="chat__log" ref={chat.logRef}>
            <p className="chat__bubble">{text.greeting}</p>
            {chat.messages.map((m, i) => (
              <p key={i} className={`chat__bubble ${m.role === 'user' ? 'chat__bubble--user' : ''}`}>
                {m.content}
              </p>
            ))}
            {chat.loading && <p className="chat__bubble chat__bubble--thinking">{text.thinking}</p>}
          </div>

          {chat.messages.length === 0 && (
            <div className="chips">
              {text.suggestions.map((s) => (
                <Button key={s} variant="chip" className="tool" onClick={() => chat.ask(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}

          <form className="chat__form" onSubmit={chat.handleSubmit}>
            <input
              className="field__input"
              aria-label={text.placeholder}
              placeholder={text.placeholder}
              value={chat.input}
              maxLength={2000}
              onChange={(e) => chat.setInput(e.target.value)}
            />
            <Button type="submit" disabled={chat.loading || !chat.input.trim()}>
              {text.sendLabel}
            </Button>
          </form>
          {chat.error && <p className="page__message">{chat.error}</p>}
        </section>
      )}

      <button type="button" className="chatbot__button" onClick={chat.toggle} aria-label={text.openLabel} title={text.openLabel}>
        <Mascot />
      </button>
    </div>
  )
}
