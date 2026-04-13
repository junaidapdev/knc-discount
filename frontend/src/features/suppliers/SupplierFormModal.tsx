import { useState, useEffect, useCallback } from 'react'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import { supplierSchema, type SupplierFormData } from '../../validations/supplierSchema'
import { BDA_CATEGORIES, BDA_CATEGORY_LABELS, type BDACategory } from '../../constants/bdaRules'
import type { ISupplier } from '../../interfaces/ISupplier'
import logger from '../../lib/logger'

interface SupplierFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: SupplierFormData) => Promise<void>
  editing?: ISupplier | null
}

interface FieldErrors {
  name?: string
  bda_category?: string
  target_amount?: string
  monthly_rebate?: string
  quarterly_rebate?: string
  yearly_rebate?: string
  yearly_combined?: string
  rent_percent?: string
  monthly_target?: string
  yearly_target?: string
}

const EMPTY_FORM = {
  name: '',
  bda_category: 'monthly' as BDACategory,
  target_amount: '',
  monthly_rebate: '',
  quarterly_rebate: '',
  yearly_rebate: '',
  yearly_combined: '',
  rent_percent: '',
  monthly_target: '',
  yearly_target: '',
}

type FormState = typeof EMPTY_FORM

function supplierToForm(s: ISupplier): FormState {
  const r = s.rebate_rules ?? {}
  return {
    name: s.name,
    bda_category: s.bda_category as BDACategory,
    target_amount: s.target_amount != null ? String(s.target_amount) : '',
    monthly_rebate: r.monthly_rebate != null ? String(r.monthly_rebate) : '',
    quarterly_rebate: r.quarterly_rebate != null ? String(r.quarterly_rebate) : '',
    yearly_rebate: r.yearly_rebate != null ? String(r.yearly_rebate) : '',
    yearly_combined: r.yearly_combined != null ? String(r.yearly_combined) : '',
    rent_percent: r.rent_percent != null ? String(r.rent_percent) : '',
    monthly_target: r.monthly_target != null ? String(r.monthly_target) : '',
    yearly_target: r.yearly_target != null ? String(r.yearly_target) : '',
  }
}

function parseOptionalNumber(val: string): number | null {
  const n = parseFloat(val)
  return val.trim() === '' || isNaN(n) ? null : n
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  padding: '8px 10px',
  borderRadius: 6,
  border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
})

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 8,
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
    </div>
  )
}

export default function SupplierFormModal({ open, onClose, onSubmit, editing }: SupplierFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(editing ? supplierToForm(editing) : EMPTY_FORM)
      setErrors({})
    }
  }, [open, editing])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handleSubmit = useCallback(async () => {
    const parsed = supplierSchema.safeParse({
      name: form.name,
      bda_category: form.bda_category,
      target_amount: parseOptionalNumber(form.target_amount),
      monthly_rebate: parseOptionalNumber(form.monthly_rebate),
      quarterly_rebate: parseOptionalNumber(form.quarterly_rebate),
      yearly_rebate: parseOptionalNumber(form.yearly_rebate),
      yearly_combined: parseOptionalNumber(form.yearly_combined),
      rent_percent: parseOptionalNumber(form.rent_percent),
      monthly_target: parseOptionalNumber(form.monthly_target),
      yearly_target: parseOptionalNumber(form.yearly_target),
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
      logger.error('SupplierFormModal submit', err)
    } finally {
      setSubmitting(false)
    }
  }, [form, onSubmit, onClose])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Supplier' : 'New Supplier'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Name */}
        <Field label="Supplier Name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Al Marai"
            style={inputStyle(!!errors.name)}
          />
        </Field>

        {/* BDA Category + Target Amount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="BDA Category" error={errors.bda_category}>
            <select
              value={form.bda_category}
              onChange={(e) => set('bda_category', e.target.value as BDACategory)}
              style={{ ...inputStyle(!!errors.bda_category), background: '#fff' }}
            >
              {BDA_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{BDA_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </Field>
          <Field label="Annual Target Amount (SR)" error={errors.target_amount}>
            <input
              type="number"
              value={form.target_amount}
              onChange={(e) => set('target_amount', e.target.value)}
              placeholder="Optional"
              min={0}
              style={inputStyle(!!errors.target_amount)}
            />
          </Field>
        </div>

        {/* Rebate Rules */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
          <p style={sectionTitleStyle}>Rebate Rules (%)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Monthly Rebate %" error={errors.monthly_rebate}>
              <input
                type="number"
                value={form.monthly_rebate}
                onChange={(e) => set('monthly_rebate', e.target.value)}
                placeholder="e.g. 2.5"
                min={0}
                max={100}
                step={0.01}
                style={inputStyle(!!errors.monthly_rebate)}
              />
            </Field>
            <Field label="Quarterly Rebate %" error={errors.quarterly_rebate}>
              <input
                type="number"
                value={form.quarterly_rebate}
                onChange={(e) => set('quarterly_rebate', e.target.value)}
                placeholder="e.g. 3"
                min={0}
                max={100}
                step={0.01}
                style={inputStyle(!!errors.quarterly_rebate)}
              />
            </Field>
            <Field label="Yearly Rebate %" error={errors.yearly_rebate}>
              <input
                type="number"
                value={form.yearly_rebate}
                onChange={(e) => set('yearly_rebate', e.target.value)}
                placeholder="e.g. 5"
                min={0}
                max={100}
                step={0.01}
                style={inputStyle(!!errors.yearly_rebate)}
              />
            </Field>
            <Field label="Yearly Combined %" error={errors.yearly_combined}>
              <input
                type="number"
                value={form.yearly_combined}
                onChange={(e) => set('yearly_combined', e.target.value)}
                placeholder="e.g. 6"
                min={0}
                max={100}
                step={0.01}
                style={inputStyle(!!errors.yearly_combined)}
              />
            </Field>
            <Field label="Rent %" error={errors.rent_percent}>
              <input
                type="number"
                value={form.rent_percent}
                onChange={(e) => set('rent_percent', e.target.value)}
                placeholder="e.g. 1"
                min={0}
                max={100}
                step={0.01}
                style={inputStyle(!!errors.rent_percent)}
              />
            </Field>
          </div>
        </div>

        {/* Targets inside rebate_rules */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
          <p style={sectionTitleStyle}>Internal Targets (SR)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Monthly Target (SR)" error={errors.monthly_target}>
              <input
                type="number"
                value={form.monthly_target}
                onChange={(e) => set('monthly_target', e.target.value)}
                placeholder="Optional"
                min={0}
                style={inputStyle(!!errors.monthly_target)}
              />
            </Field>
            <Field label="Yearly Target (SR)" error={errors.yearly_target}>
              <input
                type="number"
                value={form.yearly_target}
                onChange={(e) => set('yearly_target', e.target.value)}
                placeholder="Optional"
                min={0}
                style={inputStyle(!!errors.yearly_target)}
              />
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
