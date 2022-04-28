import { Role } from './Role.enum'

export type Card = {
  id: string
  role: Role
  name: string
  description?: string
  avatar?: string
}
