const { SchemaDirectiveVisitor } = require('apollo-server')
const { defaultFieldResolver, GraphQLString } = require('graphql')
const { formatDate } = require('../utils/format')

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field
    const { format: defaultFormat } = this.args

    field.args.push({
      name: 'format',
      type: GraphQLString,
    })

    field.resolve = async function (root, { format, ...rest }, ctx, info) {
      const date = await resolve.call(this, root, rest, ctx, info)
      return formatDate(date, format || defaultFormat)
    }
  }
}

module.exports = {
  FormatDateDirective,
}
