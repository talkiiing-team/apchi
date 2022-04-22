import { useTable } from '@apchi/shared/src/base/useTable'
import { beforeEach, describe, expect, it } from 'vitest'

type User = {
  id: number
  name: string
  age: number
}

const excludeId = (user: User): Omit<User, 'id'> => {
  const { id, ...restUser } = user
  return restUser
}

type UserWithoutId = Omit<User, 'id'>

describe('useTable test set', () => {
  const users = useTable({})<User, 'id'>('users', 'id')

  beforeEach(() => {
    users._clean()
  })

  it('should create a user and give him an id', () => {
    const userToCreate: UserWithoutId = {
      name: 'Max',
      age: 1,
    }

    const createdUser = users.create(userToCreate)

    expect(createdUser).toHaveProperty('id')

    expect(excludeId(createdUser)).toStrictEqual(userToCreate)
  })

  it('should create another user and give them different ids', () => {
    const usersToCreate: UserWithoutId[] = [
      {
        name: 'Anthony',
        age: 1000,
      },
      {
        name: 'Fu',
        age: 100,
      },
    ]

    usersToCreate.forEach(v => {
      users.create(v)
    })

    const dumpedTable = users.dumpToArray()

    const dumpedIds = dumpedTable.map(v => v.id)

    expect(dumpedIds[0]).not.toBe(dumpedIds[1])

    const tableWithoutIds = dumpedTable.map(v => excludeId(v))

    expect(tableWithoutIds).toStrictEqual(usersToCreate)
  })
})
