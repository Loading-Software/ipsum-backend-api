const mongoose = require('mongoose')
const { getUserFromToken } = require('../../../utils/auth')
const resolvers = require('../task.resolvers')
const { models } = require('../../../types')

describe('Task resolvers', () => {
  // QUERIES
  describe('Queries', () => {
    describe('without auth', () => {
      test('task gets one by id in args', async () => {
        const user = mongoose.Types.ObjectId()
        const task = await models.Task.create({
          name: 'Task A',
          description: 'Description A',
          createdBy: user,
        })

        const result = await resolvers.Query.task(
          null,
          { id: task._id },
          models
        )
        expect(`${result._id}`).toBe(`${task._id}`)
      })

      test('tasks gets all tasks', async () => {
        const user = mongoose.Types.ObjectId()
        const tasks = await models.Task.create(
          {
            name: 'Task A',
            description: 'Description A',
            createdBy: user,
          },
          {
            name: 'Task B',
            description: 'Description B',
            createdBy: user,
          }
        )

        const result = await resolvers.Query.tasks(null, {}, models)

        expect(result).toHaveLength(2)
        tasks.forEach((t) => {
          const match = result.find((r) => `${r._id}` === `${t._id}`)
          expect(match).toBeTruthy()
        })
      })
    })
  })

  // MUTATIONS
  describe('Mutations', () => {
    describe('without auth', () => {
      test('createTask creates a new task from args', async () => {
        const args = {
          input: {
            name: 'Task A',
            description: 'Description A',
          },
        }

        const ctx = { ...models, user: { _id: mongoose.Types.ObjectId() } }
        const result = await resolvers.Mutation.createTask(null, args, ctx)

        Object.keys(args.input).forEach(async (field) => {
          expect(result[field]).toBe(args.input[field])
        })
      })

      test('updateTask updates existing task from args', async () => {
        const user = mongoose.Types.ObjectId()
        const task = await models.Task.create({
          name: 'Task A',
          description: 'Description A',
          createdBy: user,
        })

        const args = {
          id: task._id,
          input: {
            name: 'Task B',
          },
        }

        const result = await resolvers.Mutation.updateTask(null, args, models)

        expect(`${result._id}`).toBe(`${task._id}`)
        expect(result.name).toBe('Task B')
      })

      test('deleteTask deletes existing task from args', async () => {
        const user = mongoose.Types.ObjectId()
        const task = await models.Task.create({
          name: 'Task A',
          description: 'Description A',
          createdBy: user,
        })

        const args = { id: task._id }
        const result = await resolvers.Mutation.deleteTask(null, args, models)

        expect(`${result._id}`).toBe(`${task._id}`)
      })
    })
  })

  // TYPES
  describe('Types', () => {
    test('resolves task createdBy', async () => {
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
      const task = await models.Task.create({
        name: 'Task A',
        description: 'Description A',
        createdBy: user._id,
      })
      const resolver = resolvers.Task.createdBy
      expect(user).toMatchObject(await resolver(task, null, models))
    })
  })
})
