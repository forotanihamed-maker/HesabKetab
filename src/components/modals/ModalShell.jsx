import { X } from 'lucide-react'

export default function ModalShell({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-btn" type="button" onClick={onClose} aria-label="بستن"><X /></button></div>
      {children}
    </section>
  </div>
}
