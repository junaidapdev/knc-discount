import { BarChart3 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import EmptyState from '../../components/EmptyState'
import { TAB_LABELS } from '../../constants/appConstants'

interface StatCardProps {
  label: string
  value: string
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '20px 24px',
      flex: 1,
    }}>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { canEdit } = useAuth()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{TAB_LABELS.ANALYTICS}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
          Rebate target tracking, performance dashboard, and points ledger.
          {!canEdit && ' (Read-only view)'}
        </p>
      </div>

      {/* KPI summary row — placeholder zeros */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Purchase Value" value="$0" sub="No data yet" />
        <StatCard label="Expected Rebate" value="$0" sub="No data yet" />
        <StatCard label="Received Rebate" value="$0" sub="No data yet" />
        <StatCard label="Points Balance" value="0 pts" sub="No data yet" />
      </div>

      <EmptyState
        icon={<BarChart3 size={40} color="#cbd5e1" />}
        title="No analytics data yet"
        description="Data will appear here once purchase orders and rebates are logged."
      />
    </div>
  )
}
