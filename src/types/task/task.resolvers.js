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

const updateTask = async (_, args, { user, Task }) => {
  return await Task.create({ ...args.input, createdBy: user._id })
}

const deleteTask = async (_, { id }, { user, Task }) => {
  const task = await Task.findById(id)

  if (!task) {
    // Task does not exist in db
    throw new Error(`task with id ${id} not found`)
  } else if (!task.createdBy.equals(user._id)) {
    // Must be a
    throw new Error('cannot delete task you do not own')
  } else {
    await Task.deleteById(id)
    return task
  }
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
