export interface IRebate {
  id: string
  purchaseOrderId: string
  creditNoteId: string | null
  supplierId: string
  supplierName: string
  period: string
  expectedAmount: number
  receivedAmount: number | null
  variance: number | null
  status: 'pending' | 'verified' | 'rejected'
  verifiedBy: string | null
  verifiedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}
