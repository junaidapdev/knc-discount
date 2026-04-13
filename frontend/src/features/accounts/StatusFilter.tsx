import { CREDIT_NOTE_STATUS, CREDIT_NOTE_STATUS_LABELS, type CreditNoteStatus } from '../../constants/appConstants'

type FilterValue = CreditNoteStatus | 'all'

interface StatusFilterProps {
  value: FilterValue
  onChange: (value: FilterValue) => void
  counts: Record<CreditNoteStatus | 'all', number>
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: CREDIT_NOTE_STATUS.PENDING, label: CREDIT_NOTE_STATUS_LABELS.pending },
  { value: CREDIT_NOTE_STATUS.RECEIVED, label: CREDIT_NOTE_STATUS_LABELS.received },
  { value: CREDIT_NOTE_STATUS.DISPUTED, label: CREDIT_NOTE_STATUS_LABELS.disputed },
]

export default function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
      {FILTERS.map((f) => {
        const isActive = value === f.value
        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#0f172a' : '#64748b',
              background: isActive ? '#fff' : 'transparent',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f.label} ({counts[f.value]})
          </button>
        )
      })}
    </div>
  )
}
