const { models } = require('../types')

// Delete data
const truncateDB = async () => {
  await models.User.deleteMany({}, function (err) {})
  await models.Task.deleteMany({}, function (err) {})
}

const populateDB = async () => {
  // Users
  const users = [
    {
      name: 'Admin',
      surname1: 'Admin',
      surname2: 'Admin',
      email: 'admin@example.com',
      password: '12345',
      phone: '648861679',
      role: 'ADMIN',
    },
    {
      name: 'Trainer',
      surname1: 'Trainer',
      surname2: 'Trainer',
      email: 'trainer@example.com',
      password: '12345',
      phone: '648861679',
      role: 'TRAINER',
    },
    // {
    //   name: 'Trainer2',
    //   surname1: 'Trainer2',
    //   surname2: 'Trainer2',
    //   email: 'trainer2@example.com',
    //   password: '12345',
    //   phone: '648861679',
    //   role: 'TRAINER',
    // },
    {
      name: 'Athlete',
      surname1: 'Athlete',
      surname2: 'Athlete',
      email: 'athlete@example.com',
      password: '12345',
      phone: '648861679',
      role: 'ATHLETE',
    },
  ]

  const adminUser = await models.User.create(users)

  // Task
  // const tasks = [
  //   {
  //     name: 'Task 1',
  //     description: 'Description for task 1',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 2',
  //     description: 'Description for task 2',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 3',
  //     description: 'Description for task 3',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 4',
  //     description: 'Description for task 4',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 5',
  //     description: 'Description for task 5',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 6',
  //     description: 'Description for task 6',
  //     createdBy: adminUser[2]._id,
  //   },
  //   {
  //     name: 'Task 7',
  //     description: 'Description for task 7',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 8',
  //     description: 'Description for task 8',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 9',
  //     description: 'Description for task 9',
  //     createdBy: adminUser[1]._id,
  //   },
  //   {
  //     name: 'Task 10',
  //     description: 'Description for task 10',
  //     createdBy: adminUser[2]._id,
  //   },

  // ]

  // await models.Task.create(tasks)
}

module.exports = {
  truncateDB,
  populateDB,
}
