// Compatibility facade. New code should import utilities from their focused modules.
export { formatNumber, toman, normalizeDigits, formatAmountInput } from './utils/number'
export { formatPersianDate, jalaliToGregorian, dateLabel, today } from './utils/date'
export { uid } from './utils/id'
export { sum } from './utils/array'
