const {Client} = require('pg')
const connectionString = require('./connectionSecret')

const client = new Client(connectionString)
client.connect()

module.exports = client
