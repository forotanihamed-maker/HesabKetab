import PersonFormModal from './PersonFormModal'
import EntryFormModal from './EntryFormModal'
import PaymentFormModal from './PaymentFormModal'
import HomeEntryModal from './HomeEntryModal'

export default function ModalHost({ modal, onClose, onCreatePerson, onCreateEntry, onAddPayment, onUpdateEntry, onUpdatePerson, people, onQuickEntry }) {
  if (!modal) return null
  if (modal.type === 'person' || modal.type === 'editPerson') {
    return <PersonFormModal person={modal.person} onClose={onClose} onSubmit={form => modal.type === 'person' ? onCreatePerson(form.name, form.phone, form.note) : onUpdatePerson(modal.person, form)} />
  }
  if (modal.type === 'entry' || modal.type === 'editEntry') {
    return <EntryFormModal entry={modal.entry} onClose={onClose} onSubmit={form => modal.type === 'entry' ? onCreateEntry(modal.personId, form) : onUpdateEntry(modal.entry, form)} />
  }
  if (modal.type === 'quickEntry') return <HomeEntryModal people={people} onClose={onClose} onSubmit={form => { if (onQuickEntry(form)) onClose() }} />
  if (modal.type === 'payment') return <PaymentFormModal entry={modal.entry} onClose={onClose} onSubmit={form => onAddPayment(modal.entry, form)} />
  return null
}
