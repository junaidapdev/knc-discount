export interface IPointsLedger {
  id: string
  supplier_id: string | null
  item_description: string
  points_earned: number
  redeemed: boolean
  redeemed_for: string | null
  created_at: string
}

export interface IPointsLedgerWithSupplier extends IPointsLedger {
  suppliers: {
    name: string
  } | null
}
