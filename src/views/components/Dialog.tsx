import { useEffect, useRef, type ReactNode } from 'react'

// 공통 팝업 창. 브라우저 기본 <dialog>를 써서 화면 가운데에 띄웁니다 (위치 계산 코드 없음).
// open이 true면 열리고, ESC나 바깥 클릭 · 닫기 요청 시 onClose 호출

interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** 내용이 넓을 때 (문서 미리보기 등) */
  wide?: boolean
}

export default function Dialog({ open, title, onClose, children, footer, wide = false }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? 'dialog--wide' : ''}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="dialog__body">
        <h2 className="dialog__title">{title}</h2>
        {children}
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </dialog>
  )
}
