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
