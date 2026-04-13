import { TrendingDown, TrendingUp, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import { CURRENCY } from '../../constants/appConstants'
import type { AuditSummary } from '../../hooks/useAuditSummary'

interface SummaryCardsProps {
  summary: AuditSummary
}

function formatAmount(value: number): string {
  return `${value.toLocaleString(CURRENCY.LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CURRENCY.SYMBOL}`
}

interface CardDef {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards: CardDef[] = [
    {
      label: 'Total Expected',
      value: formatAmount(summary.totalExpected),
      icon: <TrendingUp size={18} />,
      color: '#3b82f6',
    },
    {
      label: 'Total Received',
      value: formatAmount(summary.totalReceived),
      icon: <DollarSign size={18} />,
      color: '#22c55e',
    },
    {
      label: 'Pending',
      value: String(summary.countPending),
      icon: <Clock size={18} />,
      color: '#eab308',
    },
    {
      label: 'Disputed',
      value: String(summary.countDisputed),
      icon: <AlertTriangle size={18} />,
      color: '#ef4444',
    },
    {
      label: 'Net Leakage',
      value: formatAmount(summary.netLeakage),
      icon: <TrendingDown size={18} />,
      color: summary.netLeakage > 0 ? '#ef4444' : '#22c55e',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: card.color }}>{card.icon}</span>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{card.label}</span>
          </div>
          <p style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: '#0f172a',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
