export interface ICreditNote {
  id: string
  creditNoteNumber: string
  purchaseOrderId: string
  supplierId: string
  supplierName: string
  issueDate: string
  amount: number
  currency: string
  status: 'open' | 'applied' | 'cancelled'
  verifiedBy: string | null
  verifiedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}
