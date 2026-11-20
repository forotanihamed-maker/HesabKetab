export default function SummaryCard({ title, value, icon, tone, hint }) {
  return (
    <div className="summary-card">
      <div className={`summary-icon ${tone}`}>{icon}</div>
      <div className="summary-title">{title}</div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  )
}
