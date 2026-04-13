import { useState, useCallback } from 'react'
import { Star, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSuppliers } from '../../hooks/useSuppliers'
import { useTargetProgress } from '../../hooks/useTargetProgress'
import { usePointLedger } from '../../hooks/usePointLedger'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Skeleton from '../../components/Skeleton'
import { TAB_LABELS } from '../../constants/appConstants'
import TargetTracker from './TargetTracker'
import TargetAlerts from './TargetAlerts'
import PointLedgerTable from './PointLedgerTable'
import PointSummaryCard from './PointSummaryCard'
import PointEntryForm from './PointEntryForm'
import type { IPointsLedgerWithSupplier } from '../../interfaces/IPointsLedger'
import type { PointFormValues } from '../../validations/pointSchema'
import logger from '../../lib/logger'

export default function AnalyticsPage() {
  const { canEdit } = useAuth()
  const { suppliers, loading: suppliersLoading } = useSuppliers()
  const { progress, loading: progressLoading, error: progressError } = useTargetProgress(suppliers)
  const { entries, loading: pointsLoading, error: pointsError, create, update, remove } = usePointLedger()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<IPointsLedgerWithSupplier | null>(null)

  const handleNewPoint = useCallback(() => {
    setEditingPoint(null)
    setModalOpen(true)
  }, [])

  const handleEditPoint = useCallback((entry: IPointsLedgerWithSupplier) => {
    setEditingPoint(entry)
    setModalOpen(true)
  }, [])

  const handleDeletePoint = useCallback(async (id: string) => {
    const result = await remove(id)
    if (!result.success) logger.error('delete point failed', result.error)
  }, [remove])

  const handleSubmitPoint = useCallback(async (data: PointFormValues) => {
    if (editingPoint) {
      const result = await update(editingPoint.id, data)
      if (!result.success) throw new Error(result.error)
    } else {
      const result = await create(data)
      if (!result.success) throw new Error(result.error)
    }
  }, [editingPoint, create, update])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingPoint(null)
  }, [])

  const isLoading = suppliersLoading || progressLoading

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{TAB_LABELS.ANALYTICS}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Rebate target tracking, performance dashboard, and points ledger.
            {!canEdit && ' (Read-only view)'}
          </p>
        </div>
      </div>

      {/* Target section */}
      {isLoading ? (
        <div style={{ marginBottom: 32 }}>
          <Skeleton height={20} width={160} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
                <Skeleton height={16} width="60%" />
                <div style={{ marginTop: 12 }}><Skeleton height={8} /></div>
                <div style={{ marginTop: 8 }}><Skeleton height={12} width="80%" /></div>
              </div>
            ))}
          </div>
        </div>
      ) : progressError ? (
        <div style={{ padding: 24, color: '#ef4444', fontSize: 14, marginBottom: 24 }}>{progressError}</div>
      ) : (
        <>
          <TargetAlerts progress={progress} />
          <TargetTracker progress={progress} />
        </>
      )}

      {/* Points Ledger section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Points Ledger</h2>
        {canEdit && (
          <Button onClick={handleNewPoint}>
            <Plus size={14} />
            Add Points
          </Button>
        )}
      </div>

      {pointsLoading ? (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={20} />)}
          </div>
        </div>
      ) : pointsError ? (
        <div style={{ padding: 24, color: '#ef4444', fontSize: 14 }}>{pointsError}</div>
      ) : (
        <>
          <PointSummaryCard entries={entries} />
          {entries.length === 0 ? (
            <EmptyState
              icon={<Star size={40} color="#cbd5e1" />}
              title="No points entries yet"
              description={canEdit ? 'Add your first points entry to start tracking.' : 'No points have been logged.'}
              action={canEdit ? (
                <Button onClick={handleNewPoint}><Plus size={14} /> Add Points</Button>
              ) : undefined}
            />
          ) : (
            <PointLedgerTable
              entries={entries}
              onEdit={handleEditPoint}
              onDelete={handleDeletePoint}
            />
          )}
        </>
      )}

      {canEdit && (
        <PointEntryForm
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPoint}
          suppliers={suppliers}
          editing={editingPoint}
        />
      )}
    </div>
  )
}
