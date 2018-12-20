const mongoose = require('mongoose')
const connectionString = 'mongodb+srv://vinayak:1.618033@cluster0-synfk.mongodb.net/users?retryWrites=true'

mongoose.connect(connectionString, { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', (error) => {
  console.log(error)
  console.log('Error connectiong to the database!')
})
db.once('open', () => {
  console.log('Successfully connected to the database...')
})

const userDataSchema = new mongoose.Schema({
  id : Schema.Types.ObjectId,
  token : String,
  expires : Number,
  email : String,
  password : String
})

const userData = mongoose.model('userData', userDataSchema)
