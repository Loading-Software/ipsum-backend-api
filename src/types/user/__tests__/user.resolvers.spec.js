const { getUserFromToken } = require('../../../utils/auth')
const resolvers = require('../user.resolvers')
const { models } = require('../../../types')

describe('User resolvers', () => {
  // QUERIES
  describe('Queries', () => {
    describe('without auth', () => {
      test('user gets one by id in args', async () => {
        const user = await models.User.create({
          name: 'Nico',
          surname1: 'Acosta',
          surname2: 'Pachon',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          phone: '648861679',
          role: 'ADMIN',
        })

        const result = await resolvers.Query.user(
          null,
          { id: user._id },
          models
        )
        expect(`${result._id}`).toBe(`${user._id}`)
      })

      test('users gets all users', async () => {
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

        const result = await resolvers.Query.users(null, {}, models)

        expect(result).toHaveLength(2)
        users.forEach((u) => {
          const match = result.find((r) => `${r._id}` === `${u._id}`)
          expect(match).toBeTruthy()
        })
      })
    })
  })

  // MUTATIONS
  describe('Mutations', () => {
    test('createUser creates a new user from args', async () => {
      const args = {
        input: {
          name: 'Nico',
          surname1: 'Acosta',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          role: 'ADMIN',
        },
      }

      const result = await resolvers.Mutation.createUser(null, args, models)

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

    test('updateUser updates existing user from args', async () => {
      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user._id,
        input: {
          name: 'Nicolas',
        },
      }

      const result = await resolvers.Mutation.updateUser(null, args, models)

      expect(`${result._id}`).toBe(`${user._id}`)
      expect(result.name).toBe('Nicolas')
    })

    test('removeUser deletes existing user from args', async () => {
      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user._id,
      }

      const result = await resolvers.Mutation.removeUser(null, args, models)

      expect(`${result._id}`).toBe(`${user._id}`)
    })

    test('signin from args', async () => {
      const userModel = {
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      }

      const user = await models.User.create(userModel)

      const args = {
        input: {
          email: userModel.email,
          password: userModel.password,
        },
      }

      const result = await resolvers.Mutation.signin(null, args, models)
      const userFromToken = await getUserFromToken(result.token)
      expect(userFromToken).toBeTruthy()
      expect(user).toMatchObject(result.user)
    })
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
