export default function Eyebrow({ children }) {
  return (
    <div className="tm-eyebrow">
      <span className="tm-eyebrow-line" />
      <span className="font-mono tm-eyebrow-text">{children}</span>
      <span className="tm-eyebrow-line" />
    </div>
  );
}
