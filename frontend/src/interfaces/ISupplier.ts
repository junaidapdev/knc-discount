import type { IBDARules } from './IBDARules'

export interface ISupplier {
  id: string
  name: string
  bda_category: string
  rebate_rules: IBDARules
  target_amount: number | null
  created_at: string
}
