export const toman = (value) => new Intl.NumberFormat('fa-IR').format(Number(value || 0)) + ' تومان'
export const dateLabel = (value) => {
  try { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value)) }
  catch { return value || '' }
}
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
export const today = () => new Date().toISOString().slice(0, 10)
export const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0)