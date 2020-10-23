const tasks = async (_, args, { Task }) => {
  return await Task.find({ ...args })
    .lean()
    .exec()
}

const createTask = async (_, args, { user, Task }) => {
  return await Task.create({ ...args.input, createdBy: user._id })
}

// TODO:
const updateTask = async (_, args, { user, Task }) => {
  return await Task.create({ ...args.input, createdBy: user._id })
}

// TODO: Check role, an admin can delete without checks
const deleteTask = async (_, args, { user, Task }) => {
  const task = await Task.findById({ ...args.input })

  if (!task) {
    // Task does not exist in db
    throw new Error(`task with id ${args.input._id} not found`)
  } else if (!task.createdBy.equals(user._id)) {
    // Must be a
    throw new Error('cannot delete task you do not own')
  } else {
    await Task.deleteOne({ ...args.input })
    return task
  }
}

module.exports = {
  Query: {
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
