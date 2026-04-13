import { format, parseISO } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import { DATE_FORMAT } from '../../constants/appConstants'
import type { IPointsLedgerWithSupplier } from '../../interfaces/IPointsLedger'

interface PointLedgerTableProps {
  entries: IPointsLedgerWithSupplier[]
  onEdit: (entry: IPointsLedgerWithSupplier) => void
  onDelete: (id: string) => void
}

export default function PointLedgerTable({ entries, onEdit, onDelete }: PointLedgerTableProps) {
  const { canEdit } = useAuth()

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '12px 12px',
    fontSize: 14,
    color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
  }

  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Supplier</th>
            <th style={thStyle}>Description</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Points</th>
            <th style={thStyle}>Redeemed</th>
            <th style={thStyle}>Redeemed For</th>
            <th style={thStyle}>Date</th>
            {canEdit && <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td style={tdStyle}>{entry.suppliers?.name ?? '—'}</td>
              <td style={tdStyle}>{entry.item_description}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#3b82f6' }}>
                {entry.points_earned.toLocaleString()}
              </td>
              <td style={tdStyle}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: entry.redeemed ? '#dcfce7' : '#f1f5f9',
                  color: entry.redeemed ? '#166534' : '#475569',
                }}>
                  {entry.redeemed ? 'Yes' : 'No'}
                </span>
              </td>
              <td style={{ ...tdStyle, color: '#64748b' }}>{entry.redeemed_for ?? '—'}</td>
              <td style={{ ...tdStyle, color: '#64748b' }}>
                {format(parseISO(entry.created_at), DATE_FORMAT)}
              </td>
              {canEdit && (
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    <Button variant="ghost" onClick={() => onEdit(entry)} style={{ padding: '4px 8px' }}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" onClick={() => onDelete(entry.id)} style={{ padding: '4px 8px', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
