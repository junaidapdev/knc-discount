import { useState, useCallback, useMemo } from 'react'
import { ClipboardCheck, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCreditNotes, type CreditNoteCreateData } from '../../hooks/useCreditNotes'
import { useSuppliers } from '../../hooks/useSuppliers'
import { useAuditSummary } from '../../hooks/useAuditSummary'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Skeleton from '../../components/Skeleton'
import { TAB_LABELS, CREDIT_NOTE_STATUS, type CreditNoteStatus } from '../../constants/appConstants'
import SummaryCards from './SummaryCards'
import AuditTable from './AuditTable'
import CreditNoteModal from './CreditNoteModal'
import StatusFilter from './StatusFilter'
import type { ICreditNoteWithSupplier } from '../../interfaces/ICreditNote'
import logger from '../../lib/logger'

type FilterValue = CreditNoteStatus | 'all'

export default function AccountsPage() {
  const { canEdit } = useAuth()
  const { creditNotes, loading, error, create, update } = useCreditNotes()
  const { suppliers } = useSuppliers()
  const summary = useAuditSummary(creditNotes)

  const [filter, setFilter] = useState<FilterValue>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ICreditNoteWithSupplier | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return creditNotes
    return creditNotes.filter((n) => n.status === filter)
  }, [creditNotes, filter])

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: creditNotes.length,
      [CREDIT_NOTE_STATUS.PENDING]: 0,
      [CREDIT_NOTE_STATUS.RECEIVED]: 0,
      [CREDIT_NOTE_STATUS.DISPUTED]: 0,
    }
    for (const note of creditNotes) c[note.status]++
    return c
  }, [creditNotes])

  const handleNew = useCallback(() => { setEditing(null); setModalOpen(true) }, [])
  const handleEdit = useCallback((note: ICreditNoteWithSupplier) => { setEditing(note); setModalOpen(true) }, [])
  const handleClose = useCallback(() => { setModalOpen(false); setEditing(null) }, [])

  const handleSubmit = useCallback(async (data: CreditNoteCreateData) => {
    if (editing) {
      const result = await update(editing.id, data)
      if (!result.success) throw new Error(result.error)
    } else {
      const result = await create(data, suppliers)
      if (!result.success) throw new Error(result.error)
    }
  }, [editing, create, update, suppliers])

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
          <Button onClick={handleNew}>
            <Plus size={16} />
            New Credit Note
          </Button>
        )}
      </div>

      {loading ? (
        <>
          <div className="grid-5-cols">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px' }}>
                <Skeleton height={12} width="60%" />
                <div style={{ marginTop: 10 }}><Skeleton height={28} width="80%" /></div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={20} />)}
            </div>
          </div>
        </>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#ef4444', fontSize: 14 }}>
          {logger.error('AccountsPage', error) ?? error}
        </div>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <StatusFilter value={filter} onChange={setFilter} counts={counts} />
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={40} color="#cbd5e1" />}
              title={filter === 'all' ? 'No audit records yet' : `No ${filter} credit notes`}
              description={canEdit && filter === 'all' ? 'Add credit notes to begin reconciling rebates.' : undefined}
              action={canEdit && filter === 'all' ? (
                <Button onClick={handleNew}><Plus size={14} /> New Credit Note</Button>
              ) : undefined}
            />
          ) : (
            <AuditTable creditNotes={filtered} onEdit={handleEdit} />
          )}
        </>
      )}

      {canEdit && (
        <CreditNoteModal
          open={modalOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          suppliers={suppliers}
          editing={editing}
        />
      )}
    </div>
  )
}
