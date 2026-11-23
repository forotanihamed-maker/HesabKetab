import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

export default function ModalShell({ title, onClose, children }) {
  const modalRef = useRef(null)

  // Move focus into the dialog on open and restore it to the trigger on close.
  useEffect(() => {
    const previous = document.activeElement
    const first = modalRef.current?.querySelector(FOCUSABLE)
    ;(first || modalRef.current)?.focus()
    return () => { if (previous instanceof HTMLElement) previous.focus() }
  }, [])

  // Escape closes; Tab is kept inside the dialog.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !modalRef.current) return
      const items = [...modalRef.current.querySelectorAll(FOCUSABLE)].filter(item => item.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={modalRef} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-btn" type="button" onClick={onClose} aria-label="بستن"><X /></button></div>
      {children}
    </section>
  </div>
}
