import { type Role } from '../constants/roles'

export interface IUser {
  id: string
  email: string
  role: Role
  displayName: string
}
