const { AuthenticationError, ApolloServer } = require('apollo-server')
const { createTestClient } = require('apollo-server-testing')
const gql = require('graphql-tag')
const mongoose = require('mongoose')
const { models } = require('../../../types')
const { schemaTypes, resolvers } = require('../../../utils/schema')
const {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require('../../../directives')

describe('Task resolvers with auth', () => {
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
    const TASK = gql`
      query task($id: ID!) {
        task(id: $id) {
          _id
          name
          description
          createdBy {
            _id
            name
            surname1
            surname2
            email
            password
            phone
            role
          }
        }
      }
    `

    const TASKS = gql`
      query tasks {
        tasks {
          _id
          name
          description
          createdBy {
            _id
            name
            surname1
            surname2
            email
            password
            phone
            role
          }
        }
      }
    `

    test('task gets one by id in args not authenticated', async () => {
      const { query } = createTestServer({
        ...models,
      })

      const result = await query({
        query: TASK,
        variables: { id: '12ewe3q2' },
      })
      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('task gets one by id in args as admin', async () => {
      const { query } = createTestServer({
        user: { _id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })

      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const result = await query({
        query: TASK,
        variables: { id: task.id },
      })

      expect(result.errors).toBe(undefined)
      expect(`${result.data.task._id}`).toBe(`${task._id}`)
      expect(`${result.data.task.createdBy._id}`).toBe(`${task.createdBy._id}`)
    })

    test('task gets one by id in args as trainer', async () => {
      const { query } = createTestServer({
        user: { _id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })

      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const result = await query({
        query: TASK,
        variables: { id: task.id },
      })

      expect(result.errors).toBe(undefined)
      expect(`${result.data.task._id}`).toBe(`${task._id}`)
      expect(`${result.data.task.createdBy._id}`).toBe(`${task.createdBy._id}`)
    })

    test('task gets one by id in args not authenticated as athlete', async () => {
      const { query } = createTestServer({
        user: { _id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const result = await query({
        query: TASK,
        variables: { id: '12ewe3q2' },
      })
      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('tasks gets all tasks not authenticated', async () => {
      const { query } = createTestServer({
        ...models,
      })

      const result = await query({
        query: TASKS,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('tasks gets all tasks as admin', async () => {
      const { query } = createTestServer({
        user: { _id: '2ea323rr3r3', role: 'ADMIN' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })

      const tasks = await models.Task.create(
        {
          name: 'Task A',
          description: 'Description A',
          createdBy: user._id,
        },
        {
          name: 'Task B',
          description: 'Description B',
          createdBy: user._id,
        }
      )

      const result = await query({
        query: TASKS,
      })

      expect(result.errors).toBe(undefined)
      expect(result.data.tasks).toHaveLength(2)
      tasks.forEach((t) => {
        const match = result.data.tasks.find((r) => `${r._id}` === `${t._id}`)
        expect(match).toBeTruthy()
      })
    })

    test('tasks gets all tasks as trainer', async () => {
      const { query } = createTestServer({
        user: { _id: '2ea323rr3r3', role: 'TRAINER' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })

      const tasks = await models.Task.create(
        {
          name: 'Task A',
          description: 'Description A',
          createdBy: user._id,
        },
        {
          name: 'Task B',
          description: 'Description B',
          createdBy: user._id,
        }
      )

      const result = await query({
        query: TASKS,
      })

      expect(result.errors).toBe(undefined)
      expect(result.data.tasks).toHaveLength(2)
      tasks.forEach((t) => {
        const match = result.data.tasks.find((r) => `${r._id}` === `${t._id}`)
        expect(match).toBeTruthy()
      })
    })

    test('tasks gets all tasks as athlete', async () => {
      const { query } = createTestServer({
        user: { _id: '2ea323rr3r3', role: 'ATHLETE' },
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })

      const tasks = await models.Task.create(
        {
          name: 'Task A',
          description: 'Description A',
          createdBy: user._id,
        },
        {
          name: 'Task B',
          description: 'Description B',
          createdBy: user._id,
        }
      )

      const result = await query({
        query: TASKS,
      })

      expect(result.data.tasks).toHaveLength(tasks.length)
      expect(result.errors).not.toBe(undefined)
      result.data.tasks.forEach((t) => expect(t).not.toBeTruthy())
    })
  })

  // MUTATIONS
  describe('Mutations', () => {
    const CREATE_TASK = gql`
      mutation createTask($input: NewTaskInput!) {
        createTask(input: $input) {
          _id
          name
          description
          createdBy {
            _id
            name
            role
          }
        }
      }
    `
    const UPDATE_TASK = gql`
      mutation updateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
          _id
          name
          description
          createdBy {
            _id
            name
            role
          }
        }
      }
    `
    const DELETE_TASK = gql`
      mutation deleteTask($id: ID!) {
        deleteTask(id: $id) {
          _id
          name
          description
          createdBy {
            _id
            name
            role
          }
        }
      }
    `

    test('createTask creates a new task from args not auth', async () => {
      const { mutate } = createTestServer({
        ...models,
      })

      const args = {
        input: {
          name: 'Task A',
          description: 'Description A',
        },
      }

      const result = await mutate({
        mutation: CREATE_TASK,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('createTask creates a new task from args as admin', async () => {
      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      })
      const { mutate } = createTestServer({
        user: { _id: user._id, role: user.role },
        ...models,
      })
      const args = {
        input: {
          name: 'Task A',
          description: 'Description A',
        },
      }

      const result = await mutate({
        mutation: CREATE_TASK,
        variables: args,
      })

      Object.keys(args.input).forEach(async (field) => {
        expect(result.data.createTask[field]).toBe(args.input[field])
      })
    })

    test('createTask creates a new task from args as trainer', async () => {
      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const { mutate } = createTestServer({
        user: { _id: user._id, role: user.role },
        ...models,
      })
      const args = {
        input: {
          name: 'Task A',
          description: 'Description A',
        },
      }

      const result = await mutate({
        mutation: CREATE_TASK,
        variables: args,
      })

      Object.keys(args.input).forEach(async (field) => {
        expect(result.data.createTask[field]).toBe(args.input[field])
      })
    })

    test('createTask creates a new task from args as athlete', async () => {
      const { mutate } = createTestServer({
        user: { _id: mongoose.Types.ObjectId(), role: 'ATHLETE' },
        ...models,
      })

      const args = {
        input: {
          name: 'Task A',
          description: 'Description A',
        },
      }

      const result = await mutate({
        mutation: CREATE_TASK,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy()
    })

    test('updateTask updates existing task from args not auth', async () => {
      const { mutate } = createTestServer({
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const args = {
        id: task._id,
        input: {
          name: 'Task B',
        },
      }

      const result = await mutate({
        mutation: UPDATE_TASK,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })

    test('updateTask updates existing task from args as admin', async () => {
      const userRequestUpdate = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      })
      const { mutate } = createTestServer({
        user: userRequestUpdate,
        ...models,
      })

      const user = await models.User.create({
        name: 'Rambo',
        surname1: 'James',
        surname2: 'Papaya',
        email: 'rambo@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const args = {
        id: task.id,
        input: {
          name: 'Task B',
        },
      }

      const result = await mutate({
        mutation: UPDATE_TASK,
        variables: args,
      })

      expect(`${result.data.updateTask._id}`).toBe(`${task._id}`)
      expect(result.data.updateTask.name).toBe('Task B')
    })

    test('updateTask updates existing task from args as trainer', async () => {
      const userRequestUpdate = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const { mutate } = createTestServer({
        user: userRequestUpdate,
        ...models,
      })

      const user = await models.User.create({
        name: 'Rambo',
        surname1: 'James',
        surname2: 'Papaya',
        email: 'rambo@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const args = {
        id: task.id,
        input: {
          name: 'Task B',
        },
      }

      const result = await mutate({
        mutation: UPDATE_TASK,
        variables: args,
      })

      expect(`${result.data.updateTask._id}`).toBe(`${task._id}`)
      expect(result.data.updateTask.name).toBe('Task B')
    })

    test('updateTask updates existing task from args as athlete', async () => {
      const userRequestUpdate = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ATHLETE',
      })
      const { mutate } = createTestServer({
        userRequestUpdate,
        ...models,
      })

      const args = {
        id: mongoose.Types.ObjectId().id,
        input: {
          name: 'Task B',
        },
      }

      const result = await mutate({
        mutation: UPDATE_TASK,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })

    test('deleteTask deletes existing task from args not auth', async () => {
      const { mutate } = createTestServer({
        ...models,
      })

      const user = await models.User.create({
        name: 'Rambo',
        surname1: 'James',
        surname2: 'Papaya',
        email: 'rambo@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const args = {
        id: task.id,
      }

      const result = await mutate({
        mutation: DELETE_TASK,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })

    test('deleteTask deletes existing task from args as admin', async () => {
      const userRequestDelete = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ADMIN',
      })
      const { mutate } = createTestServer({
        user: userRequestDelete,
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const args = {
        id: task.id,
      }

      const result = await mutate({
        mutation: DELETE_TASK,
        variables: args,
      })

      expect(`${result.data.deleteTask._id}`).toBe(`${task._id}`)
      expect(`${result.data.deleteTask.createdBy._id}`).toBe(
        `${task.createdBy._id}`
      )
    })

    test('deleteTask deletes existing task from args as admin', async () => {
      const userRequestDelete = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const { mutate } = createTestServer({
        user: userRequestDelete,
        ...models,
      })

      const user = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'TRAINER',
      })
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })

      const args = {
        id: task.id,
      }

      const result = await mutate({
        mutation: DELETE_TASK,
        variables: args,
      })

      expect(`${result.data.deleteTask._id}`).toBe(`${task._id}`)
      expect(`${result.data.deleteTask.createdBy._id}`).toBe(
        `${task.createdBy._id}`
      )
    })

    test('deleteTask deletes existing task from args as athlete', async () => {
      const userRequestDelete = await models.User.create({
        name: 'Nico',
        surname1: 'Acosta',
        surname2: 'Pachon',
        email: 'nicoacosta@gmail.com',
        password: '12345',
        phone: '648861679',
        role: 'ATHLETE',
      })
      const { mutate } = createTestServer({
        user: userRequestDelete,
        ...models,
      })

      const args = {
        id: mongoose.Types.ObjectId().id,
      }

      const result = await mutate({
        mutation: DELETE_TASK,
        variables: args,
      })

      expect(result.errors).not.toBe(undefined)
      expect(result.data).not.toBeTruthy(undefined)
    })
  })
})
