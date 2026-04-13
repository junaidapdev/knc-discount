export interface IPurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  orderDate: string
  deliveryDate: string | null
  totalAmount: number
  currency: string
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled'
  bdaPercentage: number
  expectedRebate: number
  notes: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
}
