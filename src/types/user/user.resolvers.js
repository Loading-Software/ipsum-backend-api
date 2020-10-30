const { AuthenticationError } = require('apollo-server')
const { createToken } = require('../../utils/auth')

const userTypeMatcher = {
  ADMIN: 'Admin',
  TRAINER: 'Trainer',
  ATHLETE: 'Athlete',
}

const user = async (_, { id }, { User }) => {
  return await User.findById(id).lean().exec()
}

const users = async (_, __, { User }) => {
  const users = await User.find().lean().exec()
  return users
}

const createUser = async (_, { input }, { User }) => {
  return await User.create({ ...input })
}

const updateUser = async (_, { id, input }, { User }) => {
  return await User.findByIdAndUpdate(id, input, { new: true }).lean().exec()
}

const removeUser = async (_, { id }, { User }) => {
  return await User.findByIdAndDelete(id)
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

const signup = (_, { input }, { User }) => {
  throw new Error('Signup not implemented!')
}

module.exports = {
  Query: {
    user,
    users,
  },
  Mutation: {
    createUser,
    updateUser,
    removeUser,
    signin,
    signup,
  },
  User: {
    async __resolveType(user) {
      return userTypeMatcher[user.role]
    },
  },
  Admin: {
    async tasks(_, __, { user, Task }) {
      if (!user) {
        // On sign in we don't have an user yet
        return []
      }
      return await Task.find({ createdBy: user._id }).lean().exec()
    },
  },
  Trainer: {
    async tasks(_, __, { user, Task }) {
      if (!user) {
        // On sign in we don't have an user yet
        return []
      }
      return await Task.find({ createdBy: user._id }).lean().exec()
    },
  },
}
