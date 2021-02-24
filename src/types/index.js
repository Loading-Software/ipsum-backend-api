// Models

const User = require('./user/user.model')
const Task = require('./task/task.model')

module.exports = {
  models: {
    User,
    Task,
  },
}
