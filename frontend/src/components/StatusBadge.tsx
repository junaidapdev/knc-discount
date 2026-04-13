type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: '#dcfce7', color: '#166534' },
  warning: { background: '#fef9c3', color: '#854d0e' },
  error: { background: '#fee2e2', color: '#991b1b' },
  info: { background: '#dbeafe', color: '#1e40af' },
  neutral: { background: '#f1f5f9', color: '#475569' },
}

interface StatusBadgeProps {
  label: string
  variant: BadgeVariant
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const styles = VARIANT_STYLES[variant]
  return (
    <span style={{
      ...styles,
      fontSize: 12,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 4,
      letterSpacing: '0.02em',
      display: 'inline-block',
    }}>
      {label}
    </span>
  )
}
