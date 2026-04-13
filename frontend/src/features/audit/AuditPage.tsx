import { ClipboardCheck, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { TAB_LABELS } from '../../constants/appConstants'
import { ROLES } from '../../constants/roles'

export default function AuditPage() {
  const { canEdit, role } = useAuth()

  if (role === ROLES.PURCHASE_MANAGER) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{TAB_LABELS.AUDIT}</h1>
        </div>
        <EmptyState
          icon={<ClipboardCheck size={40} color="#cbd5e1" />}
          title="View-only access"
          description="Audit management is restricted to the Accounts Team."
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{TAB_LABELS.AUDIT}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Verify credit notes and reconcile supplier rebates.
          </p>
        </div>

        {canEdit && (
          <Button>
            <Plus size={16} />
            New Credit Note
          </Button>
        )}
      </div>

      <EmptyState
        icon={<ClipboardCheck size={40} color="#cbd5e1" />}
        title="No audit records yet"
        description="Add credit notes to begin reconciling rebates."
        action={canEdit ? (
          <Button>
            <Plus size={14} />
            New Credit Note
          </Button>
        ) : undefined}
      />
    </div>
  )
}
