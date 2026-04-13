import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      color: '#94a3b8',
      textAlign: 'center',
      gap: 12,
    }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 4 }}>{icon}</div>}
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#475569' }}>{title}</p>
      {description && <p style={{ margin: 0, fontSize: 14 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
