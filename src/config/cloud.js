const config = {
  secrets: {
    jwt: 'development',
    jwtExp: { expiresIn: 500 },
  },
  dbUrl:
    'mongodb+srv://admin:admin@apollo-server.9janh.mongodb.net/cloud?retryWrites=true&w=majority',
}

module.exports = config
