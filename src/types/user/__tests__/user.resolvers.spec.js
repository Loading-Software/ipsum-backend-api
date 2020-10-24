const mongoose = require('mongoose')
const { getUserFromToken } = require('../../../utils/auth')
const { AuthenticationError } = require('apollo-server')
const resolvers = require('../user.resolvers')
const { models } = require('../../../types')

describe('User resolvers', () => {
  // QUERIES
  describe('Queries', () => {
    test('user gets one by id in args', async () => {
      const users = await models.User.create(
        {
          name: 'Nico',
          surname1: 'Acosta',
          surname2: 'Pachon',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          phone: '648861679',
          role: 'ADMIN',
        },
        {
          name: 'Joan',
          surname1: 'Rao',
          surname2: 'de Azua',
          email: 'joanrao@gmail.com',
          password: '56789',
          phone: '643861679',
          role: 'TRAINER',
        }
      )

      const result = await resolvers.Query.users(
        null,
        {},
        { User: models.User }
      )

      expect(result).toHaveLength(2)
      users.forEach((u) => {
        const match = result.find((r) => `${r._id}` === `${u._id}`)
        expect(match).toBeTruthy()
      })
    })
  })

  // MUTATIONS
  describe('Mutations', () => {
    test('createUser creates a new product from args', async () => {
      const args = {
        input: {
          name: 'Nico',
          surname1: 'Acosta',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          role: 'ADMIN',
        },
      }

      const result = await resolvers.Mutation.createUser(null, args)

      Object.keys(args.input).forEach(async (field) => {
        if (field === 'password') {
          const userDBModel = new models.User({ password: result[field] })
          const isPasswordRight = await userDBModel.checkPassword(
            args.input.password
          )
          expect(isPasswordRight).toBeTruthy()
          expect(isPasswordRight).toBe(true)
        } else {
          expect(result[field]).toBe(args.input[field])
        }
      })
    })

    test('signin from args', async () => {
      const userToCreate = {
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      }

      const user = await models.User.create(userToCreate)

      const args = {
        input: {
          email: userToCreate.email,
          password: userToCreate.password,
        },
      }

      const result = await resolvers.Mutation.signin(null, args, models)
      const userFromToken = await getUserFromToken(result.token)
      expect(userFromToken).toBeTruthy()
      expect(user).toMatchObject(result.user)
    })

    // TYPES
    describe('Types', () => {
      test('resolves user interface', async () => {
        const resolver = resolvers.User.__resolveType
        expect(await resolver({ role: 'ADMIN' }, models)).toBe('Admin')
        expect(await resolver({ role: 'TRAINER' }, models)).toBe('Trainer')
        expect(await resolver({ role: 'ATHLETE' }, models)).toBe('Athlete')
        expect(await resolver({ role: 'nope' }, models)).toBe(undefined)
      })
    })
  })
})
