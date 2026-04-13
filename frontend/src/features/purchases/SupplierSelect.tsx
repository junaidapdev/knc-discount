import type { ISupplier } from '../../interfaces/ISupplier'

interface SupplierSelectProps {
  suppliers: ISupplier[]
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function SupplierSelect({ suppliers, value, onChange, error }: SupplierSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Supplier</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 10px',
          borderRadius: 6,
          border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
          fontSize: 14,
          background: '#fff',
          color: '#0f172a',
        }}
      >
        <option value="">Select a supplier</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
    </div>
  )
}
