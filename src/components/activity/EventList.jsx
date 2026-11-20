import { Activity } from 'lucide-react'
import { dateLabel, toman } from '../../utils'

export default function EventList({ events, people }) {
  return (
    <div className="event-list">
      {events.map(event => (
        <div className="event-row" key={event.id}>
          <div className="event-dot"><Activity size={15} /></div>
          <div className="event-text">
            <strong>{event.text}</strong>
            <small>{people.find(person => person.id === event.personId)?.name || 'شخص حذف‌شده'} · {dateLabel(event.date)}</small>
          </div>
          {event.amount != null && <span className="event-amount">{toman(event.amount)}</span>}
        </div>
      ))}
    </div>
  )
}
