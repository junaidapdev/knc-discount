export interface IAuditRow {
  id: string
  supplierName: string
  supplierId: string
  periodStart: string
  periodEnd: string
  totalPurchases: number
  expectedRebate: number
  receivedAmount: number
  diff: number
  diffPercent: number
  status: 'pending' | 'received' | 'disputed'
  discrepancyFlag: boolean
  isOverdue: boolean
  createdAt: string
}
