export interface ICreditNote {
  id: string
  supplier_id: string
  period_start: string
  period_end: string
  expected_amount: number
  received_amount: number
  status: 'pending' | 'received' | 'disputed'
  discrepancy_flag: boolean
  verified_by: string | null
  verified_at: string | null
  created_at: string
}

export interface ICreditNoteWithSupplier extends ICreditNote {
  suppliers: {
    name: string
  }
}
