import { useState, useEffect, useCallback } from 'react'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import { pointSchema, type PointFormValues } from '../../validations/pointSchema'
import { POINTS_DESCRIPTION_MAX_LENGTH } from '../../constants/appConstants'
import type { ISupplier } from '../../interfaces/ISupplier'
import type { IPointsLedgerWithSupplier } from '../../interfaces/IPointsLedger'
import logger from '../../lib/logger'

interface PointEntryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PointFormValues) => Promise<void>
  suppliers: ISupplier[]
  editing?: IPointsLedgerWithSupplier | null
}

interface FieldErrors {
  supplier_id?: string
  item_description?: string
  points_earned?: string
  redeemed_for?: string
}

const INITIAL: PointFormValues = {
  supplier_id: null,
  item_description: '',
  points_earned: 0,
  redeemed: false,
  redeemed_for: null,
}

export default function PointEntryForm({ open, onClose, onSubmit, suppliers, editing }: PointEntryFormProps) {
  const [form, setForm] = useState<PointFormValues>(INITIAL)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          supplier_id: editing.supplier_id,
          item_description: editing.item_description,
          points_earned: editing.points_earned,
          redeemed: editing.redeemed,
          redeemed_for: editing.redeemed_for,
        })
      } else {
        setForm(INITIAL)
      }
      setErrors({})
    }
  }, [open, editing])

  const handleSubmit = useCallback(async () => {
    const parsed = pointSchema.safeParse({
      ...form,
      points_earned: Number(form.points_earned),
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
      logger.error('PointEntryForm submit', err)
    } finally {
      setSubmitting(false)
    }
  }, [form, onSubmit, onClose])

  const updateField = <K extends keyof PointFormValues>(key: K, value: PointFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Points Entry' : 'New Points Entry'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Supplier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
            Supplier <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
          </label>
          <select
            value={form.supplier_id ?? ''}
            onChange={(e) => updateField('supplier_id', e.target.value || null)}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}
          >
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Item Description</label>
          <input
            type="text"
            value={form.item_description}
            onChange={(e) => updateField('item_description', e.target.value)}
            maxLength={POINTS_DESCRIPTION_MAX_LENGTH}
            placeholder="e.g. Ramadan display bonus"
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: errors.item_description ? '1px solid #ef4444' : '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
          {errors.item_description && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.item_description}</span>}
        </div>

        {/* Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Points Earned</label>
          <input
            type="number"
            value={form.points_earned || ''}
            onChange={(e) => updateField('points_earned', Number(e.target.value))}
            placeholder="0"
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: errors.points_earned ? '1px solid #ef4444' : '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
          {errors.points_earned && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors.points_earned}</span>}
        </div>

        {/* Redeemed toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="redeemed"
            checked={form.redeemed}
            onChange={(e) => updateField('redeemed', e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="redeemed" style={{ fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
            Redeemed
          </label>
        </div>

        {/* Redeemed For */}
        {form.redeemed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Redeemed For</label>
            <input
              type="text"
              value={form.redeemed_for ?? ''}
              onChange={(e) => updateField('redeemed_for', e.target.value || null)}
              placeholder="e.g. Gift voucher"
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update' : 'Add Points'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
