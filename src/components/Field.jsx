export default function Field({ label, children, hint }) {
  return (
    <label className="tm-field">
      <span className="tm-field-label font-mono">{label}</span>
      {children}
      {hint ? <span className="tm-field-hint">{hint}</span> : null}
    </label>
  );
}
