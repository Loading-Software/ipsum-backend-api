const { buildSchema } = require('graphql')
const { schemaToTemplateContext } = require('graphql-codegen-core')
const { schemaTypes } = require('../../../utils/schema')
const { mockServer } = require('graphql-tools')

describe('User schema', () => {
  let schema, typeDefs
  beforeAll(async () => {
    const root = `
      schema {
        query: Query
        mutation: Mutation
      }
    `
    typeDefs = root + schemaTypes.join(' ')
    schema = schemaToTemplateContext(buildSchema(typeDefs))
  })

  // TYPES
  describe('Task', () => {
    test('Type has base fields', () => {
      let type = schema.types.find((t) => {
        return t.name === 'Task'
      })
      expect(type).toBeTruthy()

      const baseFields = {
        _id: 'ID!',
        name: 'String!',
        description: 'String!',
        createdBy: 'User!',
      }

      type.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })
  })

  // INPUT TYPES
  describe('InputTypes', () => {
    test('NewTaskInput has base fields', () => {
      let input = schema.inputTypes.find((i) => {
        return i.name === 'NewTaskInput'
      })

      expect(input).toBeTruthy()

      const baseFields = {
        name: 'String!',
        description: 'String!',
      }

      input.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })

    test('UpdateTaskInput has base fields', () => {
      let input = schema.inputTypes.find((i) => {
        return i.name === 'UpdateTaskInput'
      })

      expect(input).toBeTruthy()

      const baseFields = {
        name: 'String',
        description: 'String',
      }

      input.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })
  })

  // QUERIES
  describe('Queries', () => {
    test('task query', async () => {
      const server = mockServer(typeDefs)
      const query = `
      {
        task(id: "23sfe3rfw3") {
          _id
          name
          description
          createdBy {
            _id
            name
            role
          }
        }
      }`

      await expect(server.query(query)).resolves.toBeTruthy()
      const { errors } = await server.query(query)
      expect(errors).not.toBeTruthy()
    })

    test('tasks query', async () => {
      const server = mockServer(typeDefs)
      const query = `
      {
        tasks {
          _id
          name
          description
          createdBy {
            _id
            name
            role
          }
        }
      }`
      await expect(server.query(query)).resolves.toBeTruthy()
      const { errors } = await server.query(query)
      expect(errors).not.toBeTruthy()
    })
  })

  // Mutations
  describe('Mutations', () => {
    test('createTask mutation', async () => {
      const server = mockServer(typeDefs)
      const query = `
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
      const vars = {
        input: {
          name: 'Ass moves',
          description: 'Move your ass fatty',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('updateTask mutation for admin', async () => {
      const server = mockServer(typeDefs)
      const query = `
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
      const vars = {
        id: 'i934ljf',
        input: {
          name: 'Move your ass 2',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('deleteTask mutation for admin', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation deleteTask($id: ID!) {
          deleteTask(id: $id) {
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
      const vars = {
        id: 'i934ljf',
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })
  })
})
