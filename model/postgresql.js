const {Client} = require('pg')
// const connectionString = require('./connectionSecret')
const connectionString = 'postgresql://vinayak:1.618033@localhost:5432/users'
const client = new Client(connectionString)
client.connect()

//Formulating different queries
function insertUserData(data) {
  const insertQuery = {
    name : 'store-user-info',
    text : 'INSERT INTO data(token, email, expires, password, verified) VALUES($1, $2, $3, $4, $5) RETURNING *',
    values : [`{${data.token}}`, `{${data.email}}`, data.expires, `{${data.password}}`, data.verified]
  }
  return insertQuery
}

function fetchUserData(field, value) {
  const fetchQuery = {
    name : 'get-users-data',
    text : `SELECT * FROM data where ${field}[1] = $1`,
    values : [`${value}`]
  }
  return fetchQuery
}

function updateVerifiedStatus(id) {
  const updateQuery = {
    name : 'set-verified-to-true',
    text : 'UPDATE data SET verified = true WHERE id = $1',
    values : [id]
  }
  return updateQuery
}

function deleteUserData(id) {
  const deleteQuery = {
    name : 'delete-user-data',
    text : 'DELETE FROM data WHERE id = $1',
    values : [id]
  }
  return deleteQuery
}

async function insert(data) {
  const insertQuery = insertUserData(data)
  const insertResult =
  await client.query(insertQuery)
  .catch((error) => console.log(error))
  return insertResult
}

async function fetch(field, value) {
  const fetchQuery = fetchUserData(field, value)
  const fetchResult =
  await client.query(fetchQuery)
  .catch((error) => console.log(error))
  return fetchResult
}

async function update(id) {
  const updateQuery = updateVerifiedStatus(id)
  const updateResult =
  await client.query(updateQuery)
  .catch((error) => console.log(error))
  return updateResult
}

async function deleteData(id) {
  const deleteQuery = deleteUserData(id)
  const deleteResult =
  await client.query(deleteQuery)
  .catch((error) => console.log(error))
  return deleteResult
}

const postgresql = {
  insert,
  fetch,
  update,
  deleteData
}
module.exports = postgresql
