export interface IPointsLedger {
  id: string
  supplierId: string
  supplierName: string
  period: string
  openingBalance: number
  earned: number
  redeemed: number
  closingBalance: number
  notes: string | null
  createdAt: string
  updatedAt: string
}
