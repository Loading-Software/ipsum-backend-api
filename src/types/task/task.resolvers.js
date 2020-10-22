const Task = require('./task.model')

const tasks = async (_, args, { Task }) => {
  return await Task.find({ ...args })
    .lean()
    .exec()
}

const createTask = async (_, args, { user, Task }) => {
  return await Task.create({ ...args, createdBy: user._id })
}

module.exports = {
  Query: {
    tasks,
  },
  Mutation: {
    createTask,
  },
  Task: {
    async createdBy(task, _, { User }) {
      return await User.findById(task.createdBy).lean().exec()
    },
  },
}
