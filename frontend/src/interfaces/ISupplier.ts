export interface ISupplier {
  id: string
  code: string
  name: string
  bdaRate: number
  contactName: string | null
  contactEmail: string | null
  isActive: boolean
  createdAt: string
}
