const { ApolloServer, AuthenticationError } = require('apollo-server')
const utilsDB = require('./utils/populateDB')
const config = require('./config')
const { getUserFromToken } = require('./utils/auth')
const connect = require('./db')
const {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require('./directives')
const { models } = require('./types')
const { schemaTypes, resolvers } = require('./utils/schema')

const start = async () => {
  const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
  `

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: resolvers,
    schemaDirectives: {
      authenticated: AuthenticationDirective,
      authorized: AuthorizationDirective,
      formatDate: FormatDateDirective,
    },
    async context({ req }) {
      const token = req.headers.authorization
      const user = await getUserFromToken(token)

      if (!user) {
        throw new AuthenticationError(
          'user not found from token. It may be expired'
        )
      }

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
