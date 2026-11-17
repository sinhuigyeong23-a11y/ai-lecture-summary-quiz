import type { CSSProperties } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import Button from '../components/Button'
import type { WrongNoteFile } from '../../models/study'
import { noteColors, noteFonts, notePapers, noteSizes, noteStyleContent, type Option } from '../../models/noteStyle'
import { toolbarOptions, wrongNoteContent as text } from '../../models/wrongNote'
import { useWrongNoteController } from '../../controllers/useWrongNoteController'
import { useNoteStyleController } from '../../controllers/useNoteStyleController'

// 오답노트 탭: 캔바처럼 글자를 골라 글꼴 · 크기 · 색 · 형광펜을 바꾸는 편집기 + 노트 기본 설정(종이 등)

type NoteController = ReturnType<typeof useNoteStyleController>

/** 기본 설정 한 줄: 라벨 + 선택지 칩 */
function OptionRow({ label, options, value, onChange, preview }: {
  label: string
  options: Option[]
  value: string
  onChange: (id: string) => void
  preview?: (o: Option) => CSSProperties
}) {
  return (
    <div className="decorate__row">
      <span className="decorate__label">{label}</span>
      <div className="chips">
        {options.map((o) => (
          <Button key={o.id} variant="chip" active={value === o.id} style={preview?.(o)} onClick={() => onChange(o.id)}>
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** 고른 글자에 적용하는 도구 모음 */
function Toolbar({ editor }: { editor: Editor }) {
  const run = () => editor.chain().focus()
  const font = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? ''
  const size = (editor.getAttributes('textStyle').fontSize as string | undefined) ?? ''
  const t = text.tools

  const toggle = (label: string, active: boolean, action: () => void, style?: CSSProperties) => (
    <Button variant="chip" className="tool" active={active} onClick={action} title={label} aria-label={label} style={style}>
      {label}
    </Button>
  )

  return (
    <div className="toolbar" role="toolbar" aria-label="오답노트 꾸미기 도구">
      <div className="toolbar__group">
        <select
          className="toolbar__select"
          aria-label={t.font}
          value={noteFonts.find((f) => font.includes(f.family))?.id ?? ''}
          onChange={(e) => {
            const picked = noteFonts.find((f) => f.id === e.target.value)
            if (picked) run().setFontFamily(`'${picked.family}'`).run()
            else run().unsetFontFamily().run()
          }}
        >
          <option value="">{t.font}</option>
          {noteFonts.map((f) => (
            <option key={f.id} value={f.id} style={{ fontFamily: `'${f.family}'` }}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="toolbar__select"
          aria-label={t.size}
          value={size}
          onChange={(e) => (e.target.value ? run().setFontSize(e.target.value).run() : run().unsetFontSize().run())}
        >
          <option value="">{t.size}</option>
          {toolbarOptions.sizes.map((s) => (
            <option key={s} value={s}>
              {s.replace('px', '')}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar__group">
        {toggle(t.bold, editor.isActive('bold'), () => run().toggleBold().run(), { fontWeight: 700 })}
        {toggle(t.italic, editor.isActive('italic'), () => run().toggleItalic().run(), { fontStyle: 'italic' })}
        {toggle(t.underline, editor.isActive('underline'), () => run().toggleUnderline().run(), { textDecoration: 'underline' })}
        {toggle(t.strike, editor.isActive('strike'), () => run().toggleStrike().run(), { textDecoration: 'line-through' })}
      </div>

      <div className="toolbar__group">
        <span className="toolbar__label">{t.textColor}</span>
        {toolbarOptions.textColors.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch ${editor.isActive('textStyle', { color: c }) ? 'is-active' : ''}`}
            style={{ background: c }}
            aria-label={`${t.textColor} ${c}`}
            onClick={() => run().setColor(c).run()}
          />
        ))}
      </div>

      <div className="toolbar__group">
        <span className="toolbar__label">{t.highlight}</span>
        {toolbarOptions.highlights.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch ${editor.isActive('highlight', { color: c }) ? 'is-active' : ''}`}
            style={{ background: c }}
            aria-label={`${t.highlight} ${c}`}
            onClick={() => run().toggleHighlight({ color: c }).run()}
          />
        ))}
        {toggle(t.clear, false, () => run().unsetHighlight().unsetColor().run())}
      </div>

      <div className="toolbar__group">
        {toggle(t.heading, editor.isActive('heading', { level: 3 }), () => run().toggleHeading({ level: 3 }).run())}
        {toggle(t.bullet, editor.isActive('bulletList'), () => run().toggleBulletList().run())}
        {toggle(t.alignLeft, editor.isActive({ textAlign: 'left' }), () => run().setTextAlign('left').run())}
        {toggle(t.alignCenter, editor.isActive({ textAlign: 'center' }), () => run().setTextAlign('center').run())}
        {toggle(t.undo, false, () => run().undo().run())}
        {toggle(t.redo, false, () => run().redo().run())}
      </div>
    </div>
  )
}

export default function WrongNoteSection({ lectureId, file, note, onSaved }: {
  lectureId: number
  /** 꾸밀 오답노트 파일 */
  file: WrongNoteFile
  /** 노트 기본 설정(종이 · 글꼴) */
  note: NoteController
  onSaved: (noteId: number, json: string) => void
}) {
  const { editor, saveState, reload, confirmReload } = useWrongNoteController(lectureId, file, onSaved)
  const saveLabel = { idle: '', saving: text.saving, saved: text.saved, failed: text.failed }[saveState]

  return (
    <div className="wrongnote-wrap">
      <div className="decorate">
        <div className="decorate__bar">
          <Button variant="chip" active={note.editing} onClick={note.toggleEditing}>
            {note.editing ? noteStyleContent.closeLabel : `⚙️ ${noteStyleContent.toggleLabel}`}
          </Button>
          <Button variant="chip" onClick={reload}>
            {confirmReload ? text.reloadConfirm : text.reload}
          </Button>
          <span className={`save-state save-state--${saveState}`}>{saveLabel}</span>
        </div>
        {note.editing && (
          <div className="decorate__panel">
            <OptionRow label={noteStyleContent.groups.font} options={noteFonts} value={note.style.font}
              onChange={(v) => note.change('font', v)}
              preview={(o) => ({ fontFamily: `'${noteFonts.find((f) => f.id === o.id)?.family}'` })} />
            <OptionRow label={noteStyleContent.groups.size} options={noteSizes} value={note.style.size}
              onChange={(v) => note.change('size', v)} />
            <OptionRow label={noteStyleContent.groups.paper} options={notePapers} value={note.style.paper}
              onChange={(v) => note.change('paper', v)} />
            <OptionRow label={noteStyleContent.groups.color} options={noteColors} value={note.style.color}
              onChange={(v) => note.change('color', v)}
              preview={(o) => ({ color: noteColors.find((c) => c.id === o.id)?.value })} />
            {note.error && <p className="page__message">{note.error}</p>}
          </div>
        )}
      </div>

      {editor && <Toolbar editor={editor} />}
      <p className="decorate__label">{text.hint}</p>

      <div
        className={`wrongnote wrongnote--${note.resolved.paper}`}
        style={{
          fontFamily: note.resolved.fontFamily,
          fontSize: note.resolved.fontSize,
          '--note-accent': note.resolved.color,
        } as CSSProperties}
      >
        <EditorContent editor={editor} className="wrongnote__editor" />
      </div>
    </div>
  )
}
