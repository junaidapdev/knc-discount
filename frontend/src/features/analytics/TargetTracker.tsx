import { format, parseISO } from 'date-fns'
import { DATE_FORMAT, TARGET_ALERT_THRESHOLD_PERCENT } from '../../constants/appConstants'
import { formatAmount, formatPercent } from '../../lib/formatters'
import type { TargetProgress } from '../../hooks/useTargetProgress'

interface TargetTrackerProps {
  progress: TargetProgress[]
}

function progressColor(pct: number): string {
  if (pct >= 100) return '#22c55e'
  if (pct >= TARGET_ALERT_THRESHOLD_PERCENT) return '#eab308'
  return '#ef4444'
}

export default function TargetTracker({ progress }: TargetTrackerProps) {
  const suppliersWithTarget = progress.filter((p) => p.target != null && p.target > 0)

  if (suppliersWithTarget.length === 0) return null

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
        Target Progress
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {suppliersWithTarget.map((p) => {
          const pct = Math.min(p.progressPercent, 100)
          const color = progressColor(p.progressPercent)
          const remaining = (p.target ?? 0) - p.totalPurchases

          return (
            <div
              key={p.supplier.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{p.supplier.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>
                  {formatPercent(p.progressPercent)}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: color,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                <span>{formatAmount(p.totalPurchases)} / {formatAmount(p.target ?? 0)}</span>
                <span>
                  Period: {format(parseISO(p.periodStart), DATE_FORMAT)}
                </span>
              </div>

              {remaining > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  {formatAmount(remaining)} remaining to reach target
                </p>
              )}
              {p.bda.targetMet && (
                <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                  Target met — {formatAmount(p.bda.expectedRebate)} rebate unlocked
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
