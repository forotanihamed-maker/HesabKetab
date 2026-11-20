import { useCallback, useMemo, useState } from 'react'
import { PAGE } from './constants/app'
import { useLedger } from './hooks/useLedger'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import MobileNavigation from './components/layout/MobileNavigation'
import Toast from './components/common/Toast'
import HomePage from './pages/HomePage'
import PeoplePage from './pages/PeoplePage'
import PersonPage from './pages/PersonPage'
import ActivityPage from './pages/ActivityPage'
import BackupPage from './pages/BackupPage'
import ModalHost from './components/modals/ModalHost'

export default function App() {
  const [page, setPage] = useState(PAGE.HOME)
  const [selectedPersonId, setSelectedPersonId] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const notify = useCallback(message => setToast(message), [])
  const clearToast = useCallback(() => setToast(''), [])

  const navigateToPerson = personId => {
    setSelectedPersonId(personId)
    setPage(PAGE.PERSON)
  }
  const navigate = nextPage => {
    setPage(nextPage)
    if (nextPage !== PAGE.PERSON) setSelectedPersonId(null)
  }
  const ledger = useLedger(notify, navigateToPerson)
  const selectedPerson = ledger.data.people.find(person => person.id === selectedPersonId)
  const selectedPersonTotals = selectedPerson ? ledger.getPersonTotals(selectedPerson.id) : null
  const filteredPeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return ledger.data.people.filter(person => person.name.toLocaleLowerCase().includes(query))
  }, [ledger.data.people, search])
  const openModal = (type, payload = {}) => setModal({ type, ...payload })
  const closeModal = () => setModal(null)

  function submitPerson(name, phone, note) {
    ledger.createPerson(name, phone, note)
    closeModal()
  }
  function submitEntry(personId, form) {
    if (ledger.createEntry(personId, form)) closeModal()
  }
  function submitPayment(entry, form) {
    if (ledger.addPayment(entry, form)) closeModal()
  }
  function submitEntryEdit(entry, form) {
    if (ledger.updateEntry(entry, form)) closeModal()
  }
  function submitPersonEdit(person, form) {
    if (ledger.updatePerson(person, form)) closeModal()
  }

  return (
    <div className="app-shell">
      <AppHeader onHome={() => navigate(PAGE.HOME)} />
      <div className="layout">
        <Sidebar currentPage={page} onNavigate={navigate} />
        <main className="main-content">
          {page === PAGE.HOME && <HomePage
            data={ledger.data} totals={ledger.totals} people={filteredPeople}
            search={search} onSearch={setSearch} onOpenPerson={navigateToPerson}
            onAddPerson={() => openModal('person')} onShowPeople={() => navigate(PAGE.PEOPLE)} onQuickEntry={() => openModal('quickEntry')}
          />}
          {page === PAGE.PEOPLE && <PeoplePage
            people={filteredPeople} entries={ledger.data.entries} search={search}
            onSearch={setSearch} onOpenPerson={navigateToPerson}
            onAddPerson={() => openModal('person')}
          />}
          {page === PAGE.PERSON && selectedPerson && <PersonPage
            person={selectedPerson}
            entries={ledger.data.entries.filter(entry => entry.personId === selectedPerson.id)}
            events={ledger.data.events.filter(event => event.personId === selectedPerson.id)}
            receivable={selectedPersonTotals.receivables}
            payable={selectedPersonTotals.payables}
            onBack={() => navigate(PAGE.PEOPLE)}
            onAddEntry={() => openModal('entry', { personId: selectedPerson.id })}
            onAddPayment={entry => openModal('payment', { entry })}
            onEditEntry={entry => openModal('editEntry', { entry })}
            onSettle={ledger.settleEntry} onDeleteEntry={ledger.deleteEntry}
            onDeletePayment={ledger.deletePayment}
            onEditPerson={() => openModal('editPerson', { person: selectedPerson })}
          />}
          {page === PAGE.ACTIVITY && <ActivityPage events={ledger.data.events} people={ledger.data.people} />}
          {page === PAGE.BACKUP && <BackupPage data={ledger.data} onImport={ledger.importData} />}
        </main>
      </div>
      <MobileNavigation currentPage={page} onNavigate={navigate} />
      <ModalHost modal={modal} onClose={closeModal}
        onCreatePerson={submitPerson} onCreateEntry={submitEntry}
        onAddPayment={submitPayment} onUpdateEntry={submitEntryEdit}
        onUpdatePerson={submitPersonEdit} people={ledger.data.people} onQuickEntry={ledger.createQuickEntry}
      />
      <Toast message={toast} onClose={clearToast} />
    </div>
  )
}
