const { AuthenticationError, ApolloServer } = require('apollo-server')
const { createTestClient } = require('apollo-server-testing')
const gql = require('graphql-tag')
const { models } = require('../../../types')
const { schemaTypes } = require('../../../utils/schema')
const resolvers = require('../user.resolvers')
const {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require('../../../directives')

describe('User resolvers with auth', () => {
  const root = `
        schema {
          query: Query
          mutation: Mutation
        }`
  const typeDefs = root + schemaTypes.join(' ')

  const createTestServer = (ctx) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schemaDirectives: {
        authenticated: AuthenticationDirective,
        authorized: AuthorizationDirective,
        formatDate: FormatDateDirective,
      },
      mockEntireSchema: false,
      mocks: true,
      context: () => ctx,
    })

    return createTestClient(server)
  }

  // QUERIES
  describe('Queries', () => {
    const USER = gql`
      query user($id: ID!) {
        user(id: $id) {
          _id
          name
        }
      }
    `

    const USERS = gql`
      query users {
        users {
          _id
          name
        }
      }
    `

    test('user gets one by id in args not authenticated', async () => {
      const { query } = createTestServer({
        ...models,
      })

      const result = await query({
        query: USER,
        variables: { id: '12ewe3q2' },
      })
      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('user gets one by id in args as admin', async () => {
      const { query } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      })

      const result = await query({
        query: USER,
        variables: { id: user.id },
      })
      expect(result.errors).toBe(undefined)
      expect(`${result.data.user._id}`).toBe(`${user._id}`)
    })

    test('user gets one by id in args as trainer', async () => {
      const { query } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      })

      const result = await query({
        query: USER,
        variables: { id: user.id },
      })
      expect(result.errors).toBe(undefined)
      expect(`${result.data.user._id}`).toBe(`${user._id}`)
    })

    test('user gets one by id in args as athlete', async () => {
      const { query } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      })

      const result = await query({
        query: USER,
        variables: { id: user.id },
      })
      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('users gets all users not authenticated', async () => {
      const { query } = createTestServer({
        ...models,
      })

      const result = await query({
        query: USERS,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('users gets all users as admin', async () => {
      const { query } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

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

      const result = await query({
        query: USERS,
      })

      expect(result.errors).toBe(undefined)
      expect(result.data.users).toHaveLength(2)
      users.forEach((u) => {
        const match = result.data.users.find((r) => `${r._id}` === `${u._id}`)
        expect(match).toBeTruthy()
      })
    })

    test('users gets all users as trainer', async () => {
      const { query } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

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

      const result = await query({
        query: USERS,
      })

      expect(result.errors).toBe(undefined)
      expect(result.data.users).toHaveLength(2)
      users.forEach((u) => {
        const match = result.data.users.find((r) => `${r._id}` === `${u._id}`)
        expect(match).toBeTruthy()
      })
    })

    test('users gets all users as athlete', async () => {
      const { query } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const result = await query({
        query: USERS,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })
  })

  // MUTATIONS
  describe('Mutations', () => {
    const CREATE_USER = gql`
      mutation createUser($input: NewUserInput!) {
        createUser(input: $input) {
          _id
          name
          surname1
          email
          password
          role
        }
      }
    `
    const UPDATE_USER = gql`
      mutation updateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          _id
          name
          surname1
          email
          password
          role
        }
      }
    `

    const REMOVE_USER = gql`
      mutation updateUser($id: ID!) {
        removeUser(id: $id) {
          _id
          name
          surname1
          email
          password
          role
        }
      }
    `

    test('createUser creates a new user from args not auth', async () => {
      const { mutate } = createTestServer({
        ...models,
      })

      const args = {
        input: {
          name: 'Nico',
          surname1: 'Acosta',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          role: 'ADMIN',
        },
      }

      const result = await mutate({
        mutation: CREATE_USER,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('createUser creates a new user from args as admin', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

      const args = {
        input: {
          name: 'Nico',
          surname1: 'Acosta',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          role: 'ADMIN',
        },
      }

      const result = await mutate({
        mutation: CREATE_USER,
        variables: args,
      })

      Object.keys(args.input).forEach(async (field) => {
        if (field === 'password') {
          const userDBModel = new models.User({
            password: result.data.createUser[field],
          })
          const isPasswordRight = await userDBModel.checkPassword(
            args.input.password
          )
          expect(isPasswordRight).toBeTruthy()
          expect(isPasswordRight).toBe(true)
        } else {
          expect(result.data.createUser[field]).toBe(args.input[field])
        }
      })
    })

    test('createUser creates a new user from args as trainer', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

      const args = {
        input: {
          name: 'Nico',
          surname1: 'Acosta',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          role: 'ADMIN',
        },
      }

      const result = await mutate({
        mutation: CREATE_USER,
        variables: args,
      })

      Object.keys(args.input).forEach(async (field) => {
        if (field === 'password') {
          const userDBModel = new models.User({
            password: result.data.createUser[field],
          })
          const isPasswordRight = await userDBModel.checkPassword(
            args.input.password
          )
          expect(isPasswordRight).toBeTruthy()
          expect(isPasswordRight).toBe(true)
        } else {
          expect(result.data.createUser[field]).toBe(args.input[field])
        }
      })
    })

    test('createUser creates a new user from args as athlete', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const args = {
        input: {
          name: 'Nico',
          surname1: 'Acosta',
          email: 'nicoacosta@gmail.com',
          password: '12345',
          role: 'ADMIN',
        },
      }

      const result = await mutate({
        mutation: CREATE_USER,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('updateUser updates existing user from args not auth', async () => {
      const { mutate } = createTestServer({
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
        input: {
          name: 'Nicolas',
        },
      }

      const result = await mutate({
        mutation: UPDATE_USER,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })

    test('updateUser updates existing user from args as admin', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
        input: {
          name: 'Nicolas',
        },
      }

      const result = await mutate({
        mutation: UPDATE_USER,
        variables: args,
      })

      expect(`${result.data.updateUser._id}`).toBe(`${user._id}`)
      expect(result.data.updateUser.name).toBe('Nicolas')
    })

    test('updateUser updates existing user from args as trainer', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
        input: {
          name: 'Nicolas',
        },
      }

      const result = await mutate({
        mutation: UPDATE_USER,
        variables: args,
      })

      expect(`${result.data.updateUser._id}`).toBe(`${user._id}`)
      expect(result.data.updateUser.name).toBe('Nicolas')
    })

    test('updateUser updates existing user from args as athlete', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
        input: {
          name: 'Nicolas',
        },
      }

      const result = await mutate({
        mutation: UPDATE_USER,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })

    test('removeUser updates existing user from args not auth', async () => {
      const { mutate } = createTestServer({
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
      }

      const result = await mutate({
        mutation: REMOVE_USER,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })

    test('removeUser updates existing user from args as admin', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
      }

      const result = await mutate({
        mutation: REMOVE_USER,
        variables: args,
      })

      expect(`${result.data.removeUser._id}`).toBe(`${user._id}`)
    })

    test('removeUser updates existing user from args as trainer', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
      }

      const result = await mutate({
        mutation: REMOVE_USER,
        variables: args,
      })

      expect(`${result.data.removeUser._id}`).toBe(`${user._id}`)
    })

    test('removeUser updates existing user from args as athlete', async () => {
      const { mutate } = createTestServer({
        user: { id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        role: 'ADMIN',
      })

      const args = {
        id: user.id,
      }

      const result = await mutate({
        mutation: REMOVE_USER,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })
  })
})
