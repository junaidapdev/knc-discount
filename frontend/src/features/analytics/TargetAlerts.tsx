import { AlertTriangle, TrendingUp } from 'lucide-react'
import { TARGET_NEAR_PERCENT, TARGET_ALERT_THRESHOLD_PERCENT } from '../../constants/appConstants'
import { formatAmount, formatPercent } from '../../lib/formatters'
import type { TargetProgress } from '../../hooks/useTargetProgress'

interface TargetAlertsProps {
  progress: TargetProgress[]
}

export default function TargetAlerts({ progress }: TargetAlertsProps) {
  const alerts = progress.filter(
    (p) =>
      p.target != null &&
      p.target > 0 &&
      !p.bda.targetMet &&
      p.progressPercent >= TARGET_ALERT_THRESHOLD_PERCENT,
  )

  const nearTarget = progress.filter(
    (p) => p.target != null && p.target > 0 && p.progressPercent >= TARGET_NEAR_PERCENT && !p.bda.targetMet,
  )

  if (alerts.length === 0 && nearTarget.length === 0) return null

  const combined = [
    ...nearTarget.map((p) => ({ ...p, level: 'near' as const })),
    ...alerts
      .filter((p) => p.progressPercent < TARGET_NEAR_PERCENT)
      .map((p) => ({ ...p, level: 'warn' as const })),
  ]

  if (combined.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
        Target Alerts
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {combined.map((p) => {
          const remaining = (p.target ?? 0) - p.totalPurchases
          const isNear = p.level === 'near'
          return (
            <div
              key={p.supplier.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                background: isNear ? '#fefce8' : '#fff7ed',
                border: `1px solid ${isNear ? '#fde047' : '#fdba74'}`,
              }}
            >
              {isNear
                ? <TrendingUp size={16} color="#ca8a04" />
                : <AlertTriangle size={16} color="#ea580c" />
              }
              <span style={{ fontSize: 14, color: '#1e293b' }}>
                <strong>{p.supplier.name}</strong> is at{' '}
                <strong>{formatPercent(p.progressPercent)}</strong> —{' '}
                {formatAmount(remaining)} remaining to unlock{' '}
                <strong>{p.bda.percentage}%</strong> rebate
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
