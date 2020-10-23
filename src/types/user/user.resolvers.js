const User = require('./user.model')
const { AuthenticationError } = require('apollo-server')
const { createToken } = require('../../utils/auth')

const userTypeMatcher = {
  ADMIN: 'Admin',
  TRAINER: 'Trainer',
  ATHLETE: 'Athlete',
}

const users = async (_, __, { User }) => {
  const users = await User.find().lean().exec()
  return users
}

const signin = async (_, { input }, { User }) => {
  const user = await User.findOne({ email: input.email }).lean().exec()

  if (!user) {
    throw new AuthenticationError('user not found')
  }

  const userDBModel = new User({ password: user.password })
  const isPasswordRight = await userDBModel.checkPassword(input.password)

  if (!isPasswordRight) {
    throw new AuthenticationError('incorrect credentials')
  }

  const token = createToken(user)

  return { token, user }
}

const createUser = async (_, { input }) => {
  return await User.create({ ...input })
}

module.exports = {
  Query: {
    users,
  },
  Mutation: {
    createUser,
    signin,
  },
  User: {
    async __resolveType(user, { Task }) {
      if (user.role !== 'ATHLETE') {
        user['tasks'] = await Task.find({ createdBy: user._id }).lean().exec()
      }

      return userTypeMatcher[user.role]
    },
  },
}
