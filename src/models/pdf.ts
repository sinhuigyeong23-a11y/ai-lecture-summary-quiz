// [Model] 학습 결과를 PDF 파일로 저장 (요약 · 복습 노트 · 퀴즈 · 오답노트)
// 화면에 없는 PDF 전용 문서를 만들어서 html2pdf로 변환합니다. 한글이 깨지지 않게 페이지 글꼴을 그대로 씁니다.

import {
  correctAnswer,
  formatDate,
  myAnswer,
  parseNote,
  quizSetLabel,
  summaryDetail,
  summarySections,
  type Lecture,
} from './study'
import { defaultNoteStyle, resolveNoteStyle, type NoteStyle } from './noteStyle'
import { wrongNoteDoc, wrongNoteExtensions } from './wrongNote'

type Style = Partial<CSSStyleDeclaration>

const styles: Record<string, Style> = {
  page: { width: '180mm', padding: '4mm', color: '#111', background: '#fff', fontFamily: "'Noto Sans KR', sans-serif", fontSize: '11pt', lineHeight: '1.7' },
  title: { fontSize: '18pt', fontWeight: '700', marginBottom: '2mm' },
  date: { color: '#666', fontSize: '9pt', marginBottom: '6mm' },
  section: { fontSize: '14pt', fontWeight: '700', color: '#3f4fe5', borderBottom: '1px solid #ccd', paddingBottom: '1.5mm', margin: '7mm 0 3mm' },
  heading: { fontWeight: '700', margin: '3mm 0 1mm' },
  item: { paddingLeft: '4mm' },
  question: { fontWeight: '700', marginTop: '4mm', breakInside: 'avoid' },
  choice: { paddingLeft: '4mm' },
  answer: { color: '#1a7f4b', paddingLeft: '4mm' },
  wrong: { color: '#c0392b', paddingLeft: '4mm' },
  explain: { color: '#555', paddingLeft: '4mm', fontSize: '10pt' },
}

function el(tag: string, style: Style, text?: string) {
  const node = document.createElement(tag)
  Object.assign(node.style, style)
  if (text !== undefined) node.textContent = text
  return node
}

function noteSection(root: HTMLElement, title: string, markdown: string) {
  root.append(el('h2', styles.section, title))
  for (const block of parseNote(markdown)) {
    if (block.type === 'heading') root.append(el('p', styles.heading, block.text))
    else if (block.type === 'item') root.append(el('p', styles.item, `• ${block.text}`))
    else root.append(el('p', {}, block.text))
  }
}

/** 요약: 전체 요약 · 키워드 · 개념 · 쉽게 풀어쓰기 · 시험 포인트 */
function summarySection(root: HTMLElement, lecture: Lecture) {
  const d = summaryDetail(lecture)
  const title = (id: string) => summarySections.find((s) => s.id === id)?.title ?? ''
  const overview = d.overview ?? lecture.summary
  if (!overview && !d.keywords?.length && !d.concepts?.length && !d.easySentences?.length && !d.examPoints?.length) return
  root.append(el('h2', styles.section, '요약'))
  if (overview) {
    root.append(el('p', styles.heading, title('overview')))
    parseNote(overview).forEach((b) => root.append(el('p', b.type === 'heading' ? styles.heading : styles.item, b.text)))
  }
  if (d.keywords?.length) {
    root.append(el('p', styles.heading, title('keywords')))
    root.append(el('p', styles.item, d.keywords.map((k) => `#${k}`).join('  ')))
  }
  if (d.concepts?.length) {
    root.append(el('p', styles.heading, title('concepts')))
    d.concepts.forEach((c) => root.append(el('p', styles.item, `• ${c.term} — ${c.meaning}`)))
  }
  if (d.easySentences?.length) {
    root.append(el('p', styles.heading, title('easy')))
    d.easySentences.forEach((e) => {
      root.append(el('p', { ...styles.explain, textDecoration: 'line-through' }, e.original))
      root.append(el('p', styles.item, `→ ${e.easy}`))
    })
  }
  if (d.examPoints?.length) {
    root.append(el('p', styles.heading, title('exam')))
    d.examPoints.forEach((p) => root.append(el('p', styles.item, `★ ${p}`)))
  }
}

/** 시험지 1장 (채점했으면 내 답 · 정답 · 해설까지, 아니면 문제와 내 답만) */
function quizSection(root: HTMLElement, lecture: Lecture, setId: number) {
  const index = lecture.quizSets.findIndex((s) => s.id === setId)
  const set = lecture.quizSets[index]
  if (!set) return
  const score = set.revealed ? ` — ${set.correctCount}/${set.questions.length}` : ' — 아직 채점 전'
  root.append(el('h2', styles.section, `${quizSetLabel(set, index)}${score}`))
  set.questions.forEach((q, i) => {
    const box = el('div', { breakInside: 'avoid' })
    box.append(el('p', styles.question, `${i + 1}. ${q.question}`))
    if (q.type === 'multiple') q.choices.forEach((c, ci) => box.append(el('p', styles.choice, `${ci + 1}) ${c}`)))
    if (set.revealed) {
      box.append(el('p', q.correct ? styles.answer : styles.wrong, `내 답: ${myAnswer(q) || '-'} ${q.correct ? '⭕' : '❌'}`))
      box.append(el('p', styles.answer, `정답: ${correctAnswer(q)}`))
      if (q.explanation) box.append(el('p', styles.explain, q.explanation))
    } else if (myAnswer(q)) {
      box.append(el('p', styles.choice, `내 답: ${myAnswer(q)}`))
    }
    root.append(box)
  })
}

/** 오답노트: 내가 편집기에서 꾸민 그대로 (글꼴 · 크기 · 색 · 형광펜) + 종이 스타일 */
async function wrongNoteSection(root: HTMLElement, lecture: Lecture, noteId: number, noteStyle: NoteStyle) {
  const note = lecture.wrongNotes.find((n) => n.id === noteId)
  if (!note) return
  // 편집기 문서 → HTML 변환 도구는 PDF 만들 때만 불러옴
  const { generateHTML } = await import('@tiptap/html')
  const s = resolveNoteStyle(noteStyle)
  const lineHeight = Math.round(s.fontSize * 1.9)
  const paper: Style =
    s.paper === 'lined'
      ? { backgroundImage: `repeating-linear-gradient(transparent 0 ${lineHeight - 1}px, #d6deee ${lineHeight - 1}px ${lineHeight}px)` }
      : s.paper === 'grid'
        ? { backgroundImage: 'linear-gradient(#e3e8f3 1px, transparent 1px), linear-gradient(90deg, #e3e8f3 1px, transparent 1px)', backgroundSize: '20px 20px' }
        : {}

  root.append(el('h2', { ...styles.section, color: s.color, borderBottomColor: s.color }, note.title))
  const sheet = el('div', {
    ...paper,
    fontFamily: s.fontFamily,
    fontSize: `${s.fontSize}px`,
    lineHeight: `${lineHeight}px`,
    padding: '2mm 4mm',
    background: s.paper === 'dark' ? '#1d1d24' : '#fffdf6',
    color: s.paper === 'dark' ? '#f2f2f2' : '#222',
    borderRadius: '3mm',
  })
  // 편집기가 만든 HTML (편집기 규칙에 맞는 태그 · 스타일만 들어 있음)
  sheet.innerHTML = generateHTML(wrongNoteDoc(note), wrongNoteExtensions)
  sheet.querySelectorAll<HTMLElement>('h1, h2, h3').forEach((h) => {
    h.style.color ||= s.color
  })
  root.append(sheet)
}

/** 학습 파일 1개: 요약본 / 시험지 1장 / 오답노트 */
export type StudyFileTarget = { kind: 'summary' } | { kind: 'quiz'; setId: number } | { kind: 'wrong'; noteId: number }

/** 파일 1개를 종이 모양 문서로 만들기 (마이페이지 미리보기와 PDF가 같은 문서를 씀) */
export async function renderStudyFile(lecture: Lecture, target: StudyFileTarget, noteStyle: NoteStyle = defaultNoteStyle) {
  const root = el('div', styles.page)
  root.append(el('h1', styles.title, lecture.title))
  root.append(el('p', styles.date, `Study On ai · ${formatDate(lecture.createdAt)}`))
  if (target.kind === 'summary') {
    summarySection(root, lecture)
    if (lecture.reviewNote) noteSection(root, '복습 노트', lecture.reviewNote)
  }
  if (target.kind === 'quiz') quizSection(root, lecture, target.setId)
  if (target.kind === 'wrong') await wrongNoteSection(root, lecture, target.noteId, noteStyle)
  return root
}

/** 파일 이름에 못 쓰는 글자 제거 */
const safeName = (name: string) => name.replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)

/** 파일 1개를 PDF로 내보내기 (fileTitle 예: "요약본", "시험지 2") */
export async function exportStudyFile(
  lecture: Lecture,
  target: StudyFileTarget,
  fileTitle: string,
  noteStyle: NoteStyle = defaultNoteStyle,
) {
  // 처음 저장할 때만 라이브러리를 불러와서 첫 화면 로딩을 가볍게
  const { default: html2pdf } = await import('html2pdf.js')
  await document.fonts.ready // 고른 글꼴이 다 불러와진 뒤에 그리기
  const options = {
    margin: 12,
    filename: `${safeName(lecture.title)}_${safeName(fileTitle)}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['css', 'legacy'], avoid: 'div' },
  }
  await html2pdf().set(options).from(await renderStudyFile(lecture, target, noteStyle)).save()
}
