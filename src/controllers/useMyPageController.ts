import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError, errorMessage } from '../models/api'
import { fetchMe, type User } from '../models/auth'
import { exportStudyFile, renderStudyFile } from '../models/pdf'
import { fetchLecture, fetchLectures, type Lecture, type LectureListItem } from '../models/study'
import { deleteStudyFile, myPageStats, studyFiles, type FileKind, type StudyFile } from '../models/myPage'
import { loadNoteFonts, normalizeNoteStyle } from '../models/noteStyle'

// 마이페이지: 통계 · 내 학습 파일 목록(종류별) · 파일 내용 보기 · PDF로 내보내기 (로그인 필요)
export function useMyPageController() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [list, setList] = useState<LectureListItem[] | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [filter, setFilter] = useState<FileKind | 'all'>('all')
  const [error, setError] = useState('')

  /** 열어 본 파일 + 미리보기를 넣을 자리 */
  const [opened, setOpened] = useState<StudyFile | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadNoteFonts() // 오답노트를 내가 고른 글꼴로 보여주기 위해
    Promise.all([fetchMe(), fetchLectures()])
      .then(async ([me, items]) => {
        setUser(me)
        setList(items)
        setLectures(await Promise.all(items.map((l) => fetchLecture(l.id))))
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login', { replace: true, state: { from: '/mypage' } })
        } else {
          setError(errorMessage(err))
        }
      })
  }, [navigate])

  const noteStyle = normalizeNoteStyle(user?.noteStyle)

  // 파일을 열면 PDF와 똑같은 종이 문서를 만들어 미리보기에 넣음
  useEffect(() => {
    const box = previewRef.current
    if (!opened || !box) return
    let cancelled = false
    box.replaceChildren()
    renderStudyFile(opened.lecture, opened.target, noteStyle)
      .then((doc) => !cancelled && box.replaceChildren(doc))
      .catch((err) => setError(errorMessage(err)))
    return () => {
      cancelled = true
    }
    // noteStyle은 user가 바뀔 때만 달라짐
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user])

  const exportPdf = async () => {
    if (!opened || exporting) return
    setExporting(true)
    setError('')
    try {
      await exportStudyFile(opened.lecture, opened.target, opened.name, noteStyle)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  /** 삭제: 첫 클릭은 확인 문구, 두 번째 클릭에 삭제 */
  const [confirmKey, setConfirmKey] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  const remove = async (file: StudyFile) => {
    if (confirmKey !== file.key) {
      setConfirmKey(file.key)
      return
    }
    setRemoving(true)
    setError('')
    try {
      const updated = await deleteStudyFile(file)
      setLectures((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      setList(await fetchLectures()) // 통계 다시 계산
      setConfirmKey(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setRemoving(false)
    }
  }

  /** 이전 화면(보통 학습 공간)으로. 바로 들어온 경우엔 자료 올리기 화면으로 */
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/study'))

  const files = studyFiles(lectures)

  return {
    goBack,
    user,
    loaded: list !== null,
    isEmpty: list?.length === 0,
    stats: myPageStats(list ?? []),
    filter,
    setFilter,
    files: files.filter((f) => filter === 'all' || f.target.kind === filter),
    error,
    opened,
    open: setOpened,
    close: () => !exporting && setOpened(null),
    previewRef,
    exportPdf,
    exporting,
    remove,
    confirmKey,
    removing,
  }
}
