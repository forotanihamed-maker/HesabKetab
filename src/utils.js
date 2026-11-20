const persianNumber = new Intl.NumberFormat('fa-IR')
export const formatNumber = (value) => persianNumber.format(Number(value || 0))
export const toman = (value) => formatNumber(value) + ' تومان'
export const normalizeDigits = (value) => String(value ?? '')
  .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))

export const formatAmountInput = (value) => {
  const digits = normalizeDigits(value).replace(/\D/g, '')
  if (!digits) return ''
  return BigInt(digits).toLocaleString('en-US').replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
}

const persianCalendar = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC',
})

export const formatPersianDate = (value) => {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC',
  }).format(date).replace(/\u200e/g, '').replace(/-/g, '/')
}

export const jalaliToGregorian = (input) => {
  const normalized = normalizeDigits(input).trim().replace(/[.-]/g, '/')
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null
  const [, yearText, monthText, dayText] = match
  const year = Number(yearText), month = Number(monthText), day = Number(dayText)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  // Find the matching Persian calendar day using the platform's built-in calendar data.
  const start = Date.UTC(year + 621, 2, 15)
  for (let offset = 0; offset <= 370; offset += 1) {
    const date = new Date(start + offset * 86400000)
    const parts = Object.fromEntries(persianCalendar.formatToParts(date).map(part => [part.type, part.value]))
    if (Number(parts.year) === year && Number(parts.month) === month && Number(parts.day) === day) {
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
    }
  }
  return null
}

export const dateLabel = (value) => formatPersianDate(value)
export const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
export const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0)