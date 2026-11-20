export default function FormField({ label, required = false, children }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}</label>
}
