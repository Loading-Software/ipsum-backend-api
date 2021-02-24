const { SchemaDirectiveVisitor, AuthenticationError } = require('apollo-server')
const { defaultFieldResolver } = require('graphql')

// Example
// class LogDirective extends SchemaDirectiveVisitor {
//   visitFieldDefinition(field, type) {
//     const { resolve = defaultFieldResolver } = field

//     field.resolve = async function (root, { format, ...rest }, ctx, info) {
//       console.log(`⚡️  ${type.objectType}.${field.name}`)
//       return resolve.call(this, root, rest, ctx, info)
//     }
//   }
// }

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (root, { format, ...rest }, ctx, info) {
      if (!ctx.user) {
        throw new AuthenticationError('not auth')
      }
      return resolve.call(this, root, rest, ctx, info)
    }
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field
    const { roles } = this.args

    field.resolve = async function (root, { format, ...rest }, ctx, info) {
      if (!ctx.user || !roles.find((role) => role === ctx.user.role)) {
        throw new AuthenticationError(
          `wrong role, needs to be a ${roles} to view/use ${field.name}, you're a ${ctx.user.role}`
        )
      }
      return resolve.call(this, root, rest, ctx, info)
    }
  }
}

module.exports = {
  AuthenticationDirective,
  AuthorizationDirective,
}
