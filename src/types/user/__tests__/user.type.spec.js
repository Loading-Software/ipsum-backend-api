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

  // INTERFACES
  describe('Interfaces', () => {
    test('User has base fields', () => {
      let interfaceUser = schema.interfaces.find((t) => {
        return t.name === 'User'
      })

      expect(interfaceUser).toBeTruthy()

      const baseFields = {
        _id: 'ID!',
        name: 'String!',
        surname1: 'String!',
        surname2: 'String',
        phone: 'String',
        role: 'Role!',
        email: 'String!',
        password: 'String!',
        createdAt: 'String',
        updatedAt: 'String',
        resetPasswordEmailSent: 'String',
        lastResetPassword: 'String',
      }

      interfaceUser.fields.forEach((field) => {
        const type = baseFields[field.name]
        expect(field.raw).toBe(type)
      })
    })
  })

  // ENUMS
  describe('Enums', () => {
    test('Role has base fields', () => {
      let role = schema.enums.find((r) => {
        return r.name === 'Role'
      })

      expect(role).toBeTruthy()

      const baseFields = {
        ADMIN: 'ADMIN',
        TRAINER: 'TRAINER',
        ATHLETE: 'ATHLETE',
      }

      role.values.forEach((value) => {
        const role = baseFields[value.name]
        expect(value.name).toBe(role)
      })
    })
  })

  // TYPES
  describe('Types', () => {
    test('Admin has base fields', () => {
      let type = schema.types.find((t) => {
        return t.name === 'Admin'
      })
      expect(type).toBeTruthy()

      const baseFields = {
        _id: 'ID!',
        name: 'String!',
        surname1: 'String!',
        surname2: 'String',
        phone: 'String',
        role: 'Role!',
        email: 'String!',
        password: 'String!',
        createdAt: 'String',
        updatedAt: 'String',
        resetPasswordEmailSent: 'String',
        lastResetPassword: 'String',
        tasks: '[Task!]',
      }

      type.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })

    test('Trainer has base fields', () => {
      let type = schema.types.find((t) => {
        return t.name === 'Trainer'
      })
      expect(type).toBeTruthy()

      const baseFields = {
        _id: 'ID!',
        name: 'String!',
        surname1: 'String!',
        surname2: 'String',
        phone: 'String',
        role: 'Role!',
        email: 'String!',
        password: 'String!',
        createdAt: 'String',
        updatedAt: 'String',
        resetPasswordEmailSent: 'String',
        lastResetPassword: 'String',
        tasks: '[Task!]',
      }

      type.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })

    test('Athlete has base fields', () => {
      let type = schema.types.find((t) => {
        return t.name === 'Athlete'
      })
      expect(type).toBeTruthy()

      const baseFields = {
        _id: 'ID!',
        name: 'String!',
        surname1: 'String!',
        surname2: 'String',
        phone: 'String',
        role: 'Role!',
        email: 'String!',
        password: 'String!',
        createdAt: 'String',
        updatedAt: 'String',
        resetPasswordEmailSent: 'String',
        lastResetPassword: 'String',
        pathology: 'String',
        observations: 'String',
        birthday: 'String',
        specialty: 'String',
        trainer: 'User',
      }

      type.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })

    test('AuthUser has base fields', () => {
      let type = schema.types.find((t) => {
        return t.name === 'AuthUser'
      })
      expect(type).toBeTruthy()

      const baseFields = {
        token: 'String!',
        user: 'User!',
      }

      type.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })
  })

  // INPUT TYPES
  describe('InputTypes', () => {
    test('NewUserInput has base fields', () => {
      let input = schema.inputTypes.find((i) => {
        return i.name === 'NewUserInput'
      })

      expect(input).toBeTruthy()

      const baseFields = {
        name: 'String!',
        surname1: 'String!',
        surname2: 'String',
        phone: 'String',
        role: 'Role!',
        email: 'String!',
        password: 'String!',
        pathology: 'String',
        observations: 'String',
        birthday: 'String',
        specialty: 'String',
      }

      input.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })

    test('UpdateUserInput has base fields', () => {
      let input = schema.inputTypes.find((i) => {
        return i.name === 'UpdateUserInput'
      })

      expect(input).toBeTruthy()

      const baseFields = {
        name: 'String',
        surname1: 'String',
        surname2: 'String',
        phone: 'String',
        role: 'Role',
        email: 'String',
        password: 'String',
        pathology: 'String',
        observations: 'String',
        birthday: 'String',
        specialty: 'String',
      }

      input.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })

    test('SigninInput has base fields', () => {
      let type = schema.inputTypes.find((i) => {
        return i.name === 'SigninInput'
      })

      expect(type).toBeTruthy()

      const baseFields = {
        email: 'String!',
        password: 'String!',
      }

      type.fields.forEach((field) => {
        const baseField = baseFields[field.name]
        expect(field.raw).toBe(baseField)
      })
    })
  })

  // QUERIES
  describe('Queries', () => {
    test('user query', async () => {
      const server = mockServer(typeDefs)
      const query = `
      {
        user(id: "23sfe3rfw3") {
          _id
          name
          surname1
          email
          role
        }
      }`

      await expect(server.query(query)).resolves.toBeTruthy()
      const { errors } = await server.query(query)
      expect(errors).not.toBeTruthy()
    })

    test('users query', async () => {
      const server = mockServer(typeDefs)
      const query = `
      {
        users {
          _id
          name
          surname1
          email
          role
        }
      }`
      await expect(server.query(query)).resolves.toBeTruthy()
      const { errors } = await server.query(query)
      expect(errors).not.toBeTruthy()
    })
  })

  // MUTATIONS
  describe('Mutations', () => {
    test('createUser mutation', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation createUser($input: NewUserInput!) {
          createUser(input: $input) {
            _id
            name
            surname1
            email
            role
          }
        }
      `
      const vars = {
        input: {
          name: 'John',
          surname1: 'Rambo',
          email: 'example@example',
          password: '12345',
          role: 'ADMIN',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('updateUser mutation for admin', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation updateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            ... on Trainer {
              name
              surname1
              surname2
              phone
              role
              email
              password
            }
          }
        }
      `
      const vars = {
        id: 'i934ljf',
        input: {
          name: 'John',
          surname1: 'James',
          surname2: 'Rambo',
          phone: '1946285',
          role: 'ADMIN',
          email: 'example@example.com',
          password: '12345',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('updateUser mutation for trainer', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation updateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            ... on Trainer {
              name
              surname1
              surname2
              phone
              role
              email
              password
            }
          }
        }
      `
      const vars = {
        id: 'i934ljf',
        input: {
          name: 'John',
          surname1: 'James',
          surname2: 'Rambo',
          phone: '1946285',
          role: 'TRAINER',
          email: 'example@example.com',
          password: '12345',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('updateUser mutation for athlete', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation updateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            ... on Athlete {
              name
              surname1
              surname2
              phone
              role
              email
              password
              pathology
              observations
              birthday
              specialty
            }
          }
        }
      `
      const vars = {
        id: 'i934ljf',
        input: {
          name: 'John',
          surname1: 'James',
          surname2: 'Rambo',
          phone: '1946285',
          role: 'ATHLETE',
          email: 'example@example.com',
          password: '12345',
          specialty: 'hand-to-hand combat',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('removeUser mutation for admin', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation removeUser($id: ID!) {
          removeUser(id: $id) {
            ... on Admin {
              name
              surname1
              surname2
              phone
              role
              email
              password
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

    test('removeUser mutation for trainer', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation removeUser($id: ID!) {
          removeUser(id: $id) {
            ... on Trainer {
              name
              surname1
              surname2
              phone
              role
              email
              password
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

    test('removeUser mutation for athlete', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation removeUser($id: ID!) {
          removeUser(id: $id) {
            ... on Athlete {
              name
              surname1
              surname2
              phone
              role
              email
              password
              pathology
              observations
              birthday
              specialty
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

    test('signin mutation', async () => {
      const server = mockServer(typeDefs)
      const query = `
        mutation($input: SigninInput!) {
          signin(input: $input) {
            token
            user {
              ... on Admin {
                _id
                name
                surname1
                tasks {
                  _id
                  name
                }
              }
              ... on Trainer {
                _id
                name
                tasks {
                  _id
                  name
                }
              }
              ... on Athlete {
                _id
                name
              }
            }
          }
        }
      `
      const vars = {
        input: {
          email: 'example@example',
          password: '12345',
        },
      }
      await expect(server.query(query, vars)).resolves.toBeTruthy()
      const { errors } = await server.query(query, vars)
      expect(errors).not.toBeTruthy()
    })

    test('signup mutation', async () => {
      // To be implemented
    })
  })
})
