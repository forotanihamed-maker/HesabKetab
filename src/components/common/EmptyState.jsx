export default function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <div>{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}
