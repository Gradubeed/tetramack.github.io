export default function Seal({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="var(--gold)" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="13.5" stroke="var(--gold)" strokeWidth="0.6" opacity="0.6" />
      <circle cx="20" cy="20" r="3" fill="var(--gold)" />
    </svg>
  );
}
