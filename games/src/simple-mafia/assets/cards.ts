import { Card } from '../shared'
import { Role } from '../shared/Role.enum'

export default [
  {
    name: 'Evelin McCourtney',
    role: Role.Citizen,
  },
  {
    name: 'Jay Scott',
    role: Role.Citizen,
  },
  {
    name: 'Max Stubborn',
    role: Role.Citizen,
  },
  {
    name: 'Syd Matters',
    role: Role.Citizen,
  },
  {
    name: 'Annet Greenscapes',
    role: Role.Citizen,
  },
  {
    name: 'Bimba Locado',
    role: Role.Citizen,
  },

  {
    name: 'Johnny Versanto',
    role: Role.Mafia,
  },
  {
    name: 'Otis Millbourne',
    role: Role.Mafia,
  },
  {
    name: 'Ash Extasy',
    role: Role.Mafia,
  },

  {
    name: 'Frank Costello',
    role: Role.Don,
  },

  {
    name: 'Mary Hopekins',
    role: Role.Doctor,
  },

  {
    name: 'Jack Flippers',
    role: Role.Maniac,
  },

  {
    name: 'Ally Liquella',
    role: Role.Slut,
  },

  {
    name: 'Hank Patty',
    role: Role.Police,
  },
] as Omit<Card, 'id'>[]
