const { models } = require('../types')

// Delete data
const truncateDB = async () => {
  await models.User.deleteMany({}, function (err) {})
  await models.Task.deleteMany({}, function (err) {})
}

const populateDB = async () => {
  // Users
  const user1 = {
    name: 'Nico',
    surname1: 'Acosta',
    surname2: 'Pachon',
    email: 'example@example',
    password: '12345',
    phone: '648861679',
    role: 'ADMIN',
  }

  const adminUser = await models.User.create(user1)

  // Task
  const task1 = {
    name: 'Task 1',
    description: 'Description for task 1',
    createdBy: adminUser._id,
  }

  await models.Task.create(task1)
}

module.exports = {
  truncateDB,
  populateDB,
}
