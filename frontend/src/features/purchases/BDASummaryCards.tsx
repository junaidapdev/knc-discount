import { TrendingUp, Target, AlertTriangle } from 'lucide-react'
import { CURRENCY } from '../../constants/appConstants'
import type { SupplierTotal } from '../../hooks/useSupplierTotals'

interface BDASummaryCardsProps {
  totals: SupplierTotal[]
}

function formatAmount(value: number): string {
  return `${value.toLocaleString(CURRENCY.LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CURRENCY.SYMBOL}`
}

export default function BDASummaryCards({ totals }: BDASummaryCardsProps) {
  if (totals.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(totals.length, 3)}, 1fr)`,
      gap: 16,
      marginBottom: 24,
    }}>
      {totals.map(({ supplier, totalPurchases, bda }) => (
        <div
          key={supplier.id}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '16px 20px',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{supplier.name}</span>
            {bda.targetMet ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#166534',
                background: '#dcfce7',
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                <Target size={12} /> Target Met
              </span>
            ) : supplier.target_amount ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#854d0e',
                background: '#fef9c3',
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                <AlertTriangle size={12} /> Below Target
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Total Purchases</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                {formatAmount(totalPurchases)}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Expected Rebate</p>
                <p style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <TrendingUp size={14} />
                  {formatAmount(bda.expectedRebate)}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>BDA Rate</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                  {bda.percentage}%
                </p>
              </div>
            </div>

            {supplier.target_amount != null && (
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  Target Progress ({formatAmount(totalPurchases)} / {formatAmount(supplier.target_amount)})
                </p>
                <div style={{
                  height: 6,
                  background: '#e2e8f0',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((totalPurchases / supplier.target_amount) * 100, 100)}%`,
                    background: bda.targetMet ? '#22c55e' : '#3b82f6',
                    borderRadius: 3,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
