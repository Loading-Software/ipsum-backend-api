const { ApolloServer, gql } = require('apollo-server')
const { loadFilesSync } = require('@graphql-tools/load-files')
const path = require('path')
const utilsDB = require('./utils/populateDB')
const config = require('./config')
const { getUserFromToken } = require('./utils/auth')
const connect = require('./db')
const {
  AuthenticationDirective,
  AuthorizationDirective,
} = require('./directives/auth')
const { models } = require('./types')

const env = process.env.NODE_ENV

// Load TypesDef and resolvers
const types = loadFilesSync(path.join(process.cwd(), 'src/**/**/*.gql'))
const resolvers = loadFilesSync(
  path.join(process.cwd(), 'src/types/**/*.resolvers.js')
)

const start = async () => {
  const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
  `

  const schemaTypes = types

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: resolvers,
    schemaDirectives: {
      authenticated: AuthenticationDirective,
      authorized: AuthorizationDirective,
    },
    async context({ req }) {
      const token = req.headers.authorization
      const user = await getUserFromToken(token)

      return { ...models, user }
    },
  })

  await connect(config.dbUrl)
  await utilsDB.truncateDB()
  await utilsDB.populateDB()

  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}

module.exports = start
