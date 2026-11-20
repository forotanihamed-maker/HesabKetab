import { useRef, useState } from 'react'
import { Download, ShieldCheck, Upload } from 'lucide-react'
import { downloadBackup, parseBackup } from '../services/backup'
import { formatNumber } from '../utils'

export default function BackupPage({ data, onImport }) {
  const fileInputRef = useRef(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  function report(text, error = false) {
    setMessage(text)
    setIsError(error)
  }

  function handleExport() {
    downloadBackup(data)
    report('فایل پشتیبان ساخته شد. آن را در جای امن (مثلاً ایمیل یا فضای ابری) نگه دارید.')
  }

  async function handleFileChosen(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      const question = `این پشتیبان شامل ${formatNumber(backup.people.length)} شخص و ${formatNumber(backup.entries.length)} حساب است.\n`
        + 'اطلاعات فعلی کاملاً با آن جایگزین می‌شود. (بهتر است اول از اطلاعات فعلی پشتیبان بگیرید.) ادامه می‌دهید؟'
      if (!window.confirm(question)) return
      onImport(backup)
      report('اطلاعات با موفقیت بازیابی شد.')
    } catch (error) {
      report(error.message || 'خواندن فایل ناموفق بود.', true)
    }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">امنیت اطلاعات</span><h1>پشتیبان‌گیری</h1><p>اطلاعات فقط روی همین دستگاه ذخیره می‌شوند؛ از آن‌ها فایل پشتیبان بگیرید.</p></div></div>
      <section className="content-card">
        <div className="section-heading"><div><h2>وضعیت فعلی</h2><p>{formatNumber(data.people.length)} شخص · {formatNumber(data.entries.length)} حساب · {formatNumber(data.events.length)} رویداد</p></div><ShieldCheck /></div>
        <div className="home-actions">
          <button className="primary-btn" onClick={handleExport}><Download size={18} /> دریافت فایل پشتیبان</button>
          <button className="outline-btn" onClick={() => fileInputRef.current?.click()}><Upload size={18} /> بازیابی از فایل</button>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChosen} hidden />
        {message && <p className={`form-hint ${isError ? 'orange-text' : 'green-text'}`} role="status">{message}</p>}
      </section>
    </>
  )
}
