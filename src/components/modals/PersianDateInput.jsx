import { useEffect, useState } from 'react'
import { formatPersianDate, jalaliToGregorian, normalizeDigits } from '../../utils'

export default function PersianDateInput({ value, onChange, required = false }) {
  const [display, setDisplay] = useState(() => formatPersianDate(value))
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    setDisplay(formatPersianDate(value))
    setInvalid(false)
  }, [value])

  function handleBlur(event) {
    const converted = jalaliToGregorian(display)
    if (!converted) {
      setInvalid(true)
      event.currentTarget.setCustomValidity('تاریخ شمسی معتبر وارد کنید؛ مانند ۱۴۰۵/۰۸/۲۹')
      return
    }
    setInvalid(false)
    event.currentTarget.setCustomValidity('')
    setDisplay(formatPersianDate(converted))
    if (converted !== value) onChange(converted)
  }

  return <input
    type="text"
    inputMode="numeric"
    dir="ltr"
    placeholder="۱۴۰۵/۰۸/۲۹"
    value={display}
    onChange={event => { event.target.setCustomValidity(''); setDisplay(normalizeDigits(event.target.value).replace(/[^\d/.-]/g, '')) }}
    onBlur={handleBlur}
    required={required}
    aria-label="تاریخ شمسی"
    aria-invalid={invalid}
    title={invalid ? 'تاریخ شمسی معتبر وارد کنید؛ مانند ۱۴۰۵/۰۸/۲۹' : 'تاریخ به شمسی'}
    className={invalid ? 'invalid-date' : undefined}
  />
}
