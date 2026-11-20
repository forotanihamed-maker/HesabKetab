import { Search, X } from 'lucide-react'

export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="search-box">
      <Search size={18} />
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button type="button" onClick={() => onChange('')}><X size={15} /></button>}
    </label>
  )
}
