const task = async (_, { id }, { Task }) => {
  return await Task.findById(id).lean().exec()
}

const tasks = async (_, args, { Task }) => {
  return await Task.find({ ...args })
    .lean()
    .exec()
}

const createTask = async (_, args, { user, Task }) => {
  return await Task.create({ ...args.input, createdBy: user._id })
}

const updateTask = async (_, { id, input }, { Task }) => {
  return await Task.findByIdAndUpdate(id, input, { new: true })
}

const deleteTask = async (_, { id }, { Task }) => {
  return await Task.findByIdAndDelete(id)
}

module.exports = {
  Query: {
    task,
    tasks,
  },
  Mutation: {
    createTask,
    updateTask,
    deleteTask,
  },
  Task: {
    async createdBy(task, _, { User }) {
      return await User.findById(task.createdBy).lean().exec()
    },
  },
}
