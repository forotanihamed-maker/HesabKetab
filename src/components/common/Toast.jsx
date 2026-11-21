import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timeoutId = window.setTimeout(onClose, 2800)
    return () => window.clearTimeout(timeoutId)
  }, [message, onClose])

  if (!message) return null
  return <div className="toast" role="status"><CheckCircle2 size={17} /><span>{message}</span><button type="button" onClick={onClose} aria-label="بستن"><X size={15} /></button></div>
}
