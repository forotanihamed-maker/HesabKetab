import { formatAmountInput, normalizeDigits } from '../../utils'

export default function AmountInput({ value, onChange, placeholder, max, required = false }) {
  return <input
    type="text"
    inputMode="numeric"
    dir="ltr"
    autoComplete="off"
    value={formatAmountInput(value)}
    onChange={event => {
      const digits = normalizeDigits(event.target.value).replace(/\D/g, '')
      onChange(digits)
    }}
    placeholder={placeholder || 'مثلاً ۱,۲۵۰,۰۰۰'}
    required={required}
    aria-label="مبلغ به تومان"
    data-max={max}
  />
}
