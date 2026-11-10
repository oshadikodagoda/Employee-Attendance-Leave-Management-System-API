export default function StatusBadge({ status }) {
  const s = String(status || 'pending').toLowerCase();
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return <span className={`ae-badge ae-badge-${s}`}>{label}</span>;
}
