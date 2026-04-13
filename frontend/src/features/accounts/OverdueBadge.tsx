import { AlertCircle } from 'lucide-react'

export default function OverdueBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 11,
      fontWeight: 600,
      color: '#991b1b',
      background: '#fee2e2',
      padding: '2px 7px',
      borderRadius: 4,
    }}>
      <AlertCircle size={11} />
      Overdue
    </span>
  )
}
