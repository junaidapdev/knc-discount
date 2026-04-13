import { ShoppingCart, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { TAB_LABELS } from '../../constants/appConstants'

export default function PurchasesPage() {
  const { canEdit } = useAuth()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{TAB_LABELS.PURCHASES}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Log and manage purchase orders with supplier rebate targets.
          </p>
        </div>

        {canEdit && (
          <Button>
            <Plus size={16} />
            New Purchase Order
          </Button>
        )}
      </div>

      <EmptyState
        icon={<ShoppingCart size={40} color="#cbd5e1" />}
        title="No purchase orders yet"
        description={canEdit ? 'Create your first purchase order to get started.' : 'No purchase orders have been logged.'}
        action={canEdit ? (
          <Button>
            <Plus size={14} />
            New Purchase Order
          </Button>
        ) : undefined}
      />
    </div>
  )
}
