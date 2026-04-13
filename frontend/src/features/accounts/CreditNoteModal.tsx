import { useState, useEffect, useCallback } from 'react'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import { creditNoteSchema } from '../../validations/creditNoteSchema'
import { CREDIT_NOTE_STATUS, CREDIT_NOTE_STATUS_LABELS, type CreditNoteStatus } from '../../constants/appConstants'
import { formatAmount } from '../../lib/formatters'
import type { ISupplier } from '../../interfaces/ISupplier'
import type { ICreditNoteWithSupplier } from '../../interfaces/ICreditNote'
import type { CreditNoteCreateData } from '../../hooks/useCreditNotes'
import { fetchPeriodPurchaseTotal } from '../../hooks/useCreditNotes'
import { computeSupplierBDA } from '../../lib/bdaCalculator'
import type { BDACategory } from '../../constants/bdaRules'
import logger from '../../lib/logger'

interface CreditNoteModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreditNoteCreateData) => Promise<void>
  suppliers: ISupplier[]
  editing?: ICreditNoteWithSupplier | null
}

interface FieldErrors {
  supplier_id?: string
  received_amount?: string
  status?: string
  period_start?: string
  period_end?: string
}

const STATUS_OPTIONS: { value: CreditNoteStatus; label: string }[] = [
  { value: CREDIT_NOTE_STATUS.PENDING, label: CREDIT_NOTE_STATUS_LABELS.pending },
  { value: CREDIT_NOTE_STATUS.RECEIVED, label: CREDIT_NOTE_STATUS_LABELS.received },
  { value: CREDIT_NOTE_STATUS.DISPUTED, label: CREDIT_NOTE_STATUS_LABELS.disputed },
]


export default function CreditNoteModal({ open, onClose, onSubmit, suppliers, editing }: CreditNoteModalProps) {
  const [form, setForm] = useState({
    supplier_id: '',
    period_start: '',
    period_end: '',
    received_amount: 0,
    status: CREDIT_NOTE_STATUS.PENDING as CreditNoteStatus,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Preview calculation state
  const [totalPurchases, setTotalPurchases] = useState(0)
  const [expectedRebate, setExpectedRebate] = useState(0)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          supplier_id: editing.supplier_id,
          period_start: editing.period_start,
          period_end: editing.period_end,
          received_amount: editing.received_amount,
          status: editing.status,
        })
      } else {
        setForm({
          supplier_id: '',
          period_start: '',
          period_end: '',
          received_amount: 0,
          status: CREDIT_NOTE_STATUS.PENDING as CreditNoteStatus,
        })
      }
      setErrors({})
      setTotalPurchases(0)
      setExpectedRebate(0)
    }
  }, [open, editing])

  // Auto-calculate expected rebate when supplier + period change
  useEffect(() => {
    if (!form.supplier_id || !form.period_start || !form.period_end) {
      setTotalPurchases(0)
      setExpectedRebate(0)
      return
    }
    if (form.period_end <= form.period_start) return

    const supplier = suppliers.find((s) => s.id === form.supplier_id)
    if (!supplier) return

    let cancelled = false
    setLoadingPreview(true)

    fetchPeriodPurchaseTotal(form.supplier_id, form.period_start, form.period_end)
      .then((total) => {
        if (cancelled) return
        setTotalPurchases(total)
        const period = supplier.bda_category as BDACategory
        const bda = computeSupplierBDA(total, supplier.rebate_rules, period)
        setExpectedRebate(bda.expectedRebate)
      })
      .catch((err) => logger.error('preview calculation', err))
      .finally(() => { if (!cancelled) setLoadingPreview(false) })

    return () => { cancelled = true }
  }, [form.supplier_id, form.period_start, form.period_end, suppliers])

  const handleSubmit = useCallback(async () => {
    const parsed = creditNoteSchema.safeParse({
      ...form,
      received_amount: Number(form.received_amount),
    })

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await onSubmit(parsed.data)
      onClose()
    } catch (err) {
      logger.error('CreditNoteModal submit', err)
    } finally {
      setSubmitting(false)
    }
  }, [form, onSubmit, onClose])

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const diff = expectedRebate - Number(form.received_amount)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Credit Note' : 'New Credit Note'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Supplier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Supplier</label>
          <select
            value={form.supplier_id}
            onChange={(e) => updateField('supplier_id', e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: errors.supplier_id ? '1px solid #ef4444' : '1px solid #d1d5db',
              fontSize: 14,
              background: '#fff',
            }}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.supplier_id && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.supplier_id}</span>}
        </div>

        {/* Period dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Period Start</label>
            <input
              type="date"
              value={form.period_start}
              onChange={(e) => updateField('period_start', e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: errors.period_start ? '1px solid #ef4444' : '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
            {errors.period_start && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.period_start}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Period End</label>
            <input
              type="date"
              value={form.period_end}
              onChange={(e) => updateField('period_end', e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: errors.period_end ? '1px solid #ef4444' : '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
            {errors.period_end && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.period_end}</span>}
          </div>
        </div>

        {/* Expected vs Received preview */}
        {(totalPurchases > 0 || loadingPreview) && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 14,
          }}>
            {loadingPreview ? (
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Calculating expected rebate...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Total Purchases in Period</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatAmount(totalPurchases)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Expected Rebate (auto-calculated)</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{formatAmount(expectedRebate)}</span>
                </div>
                {Number(form.received_amount) > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    paddingTop: 6,
                    borderTop: '1px solid #e2e8f0',
                  }}>
                    <span style={{ color: '#64748b' }}>Difference</span>
                    <span style={{
                      fontWeight: 600,
                      color: diff > 0 ? '#dc2626' : diff < 0 ? '#16a34a' : '#64748b',
                    }}>
                      {diff > 0 ? '-' : diff < 0 ? '+' : ''}{formatAmount(Math.abs(diff))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Received Amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Received Amount (SR)</label>
          <input
            type="number"
            value={form.received_amount || ''}
            onChange={(e) => updateField('received_amount', Number(e.target.value))}
            placeholder="0.00"
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: errors.received_amount ? '1px solid #ef4444' : '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
          {errors.received_amount && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.received_amount}</span>}
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value as CreditNoteStatus)}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: errors.status ? '1px solid #ef4444' : '1px solid #d1d5db',
              fontSize: 14,
              background: '#fff',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.status && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.status}</span>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create Credit Note'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
