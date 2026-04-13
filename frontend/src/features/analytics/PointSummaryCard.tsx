import { Star, Gift, CircleDot } from 'lucide-react'
import type { IPointsLedgerWithSupplier } from '../../interfaces/IPointsLedger'

interface PointSummaryCardProps {
  entries: IPointsLedgerWithSupplier[]
}

export default function PointSummaryCard({ entries }: PointSummaryCardProps) {
  const totalEarned = entries.reduce((sum, e) => sum + e.points_earned, 0)
  const totalRedeemed = entries.filter((e) => e.redeemed).reduce((sum, e) => sum + e.points_earned, 0)
  const balance = totalEarned - totalRedeemed

  const cards = [
    { label: 'Total Earned', value: totalEarned, icon: <Star size={16} />, color: '#3b82f6' },
    { label: 'Redeemed', value: totalRedeemed, icon: <Gift size={16} />, color: '#8b5cf6' },
    { label: 'Balance', value: balance, icon: <CircleDot size={16} />, color: '#22c55e' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ color: c.color }}>{c.icon}</span>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.label}</span>
          </div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {c.value.toLocaleString()} pts
          </p>
        </div>
      ))}
    </div>
  )
}
