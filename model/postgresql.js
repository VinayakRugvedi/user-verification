const {Client} = require('pg')
const connectionString = 'postgresql://vinayak:1.618033@localhost:5432/users'
const client = new Client(connectionString)
client.connect()

//Formulating different queries
function getInsertQuery(data) {
  const insertQuery = {
    name : 'store-user-info',
    text : 'INSERT INTO data(token, email, expires, password, verified) VALUES($1, $2, $3, $4, $5) RETURNING *',
    values : [`{${data.token}}`, `{${data.email}}`, data.expires, `{${data.password}}`, data.verified]
  }
  return insertQuery
}

function getFetchQuery(field, value) {
  const fetchQuery = {
    name : 'get-users-data',
    text : `SELECT * FROM data where ${field}[1] = $1`,
    values : [`${value}`]
  }
  return fetchQuery
}

function getUpdateQuery(id) {
  const updateQuery = {
    name : 'set-verified-to-true',
    text : 'UPDATE data SET verified = true WHERE _id = $1',
    values : [id]
  }
  return updateQuery
}

function getDeleteQuery(id) {
  const deleteQuery = {
    name : 'delete-user-data',
    text : 'DELETE FROM data WHERE _id = $1',
    values : [id]
  }
  return deleteQuery
}

async function insert(data) {
  const insertQuery = getInsertQuery(data)
  const insertResult =
  await client.query(insertQuery)
  .catch((error) => console.log(error))
  console.log(insertResult)
  return insertResult.rows
}

async function fetch(field, value) {
  const fetchQuery = getFetchQuery(field, value)
  const fetchResult =
  await client.query(fetchQuery)
  .catch((error) => console.log(error))
  console.log(fetchResult.rows)
  //Empty or not will be tested 
  return fetchResult.rows.length
         ? structuredResultObject(fetchResult.rows[0])
         : {}
}

async function update(id) {
  const updateQuery = getUpdateQuery(id)
  const updateResult =
  await client.query(updateQuery)
  .catch((error) => console.log(error))
  console.log(updateResult.rows) //It yeilds empty array
  return updateResult.rowCount
}

async function deleteData(id) {
  const deleteQuery = getDeleteQuery(id)
  const deleteResult =
  await client.query(deleteQuery)
  .catch((error) => console.log(error))
  console.log(deleteResult.rows)
  return structuredResultObject(deleteResult.rows[0])
}

function structuredResultObject(object) {
  let result = {
    _id : object._id,
    token : object.token[0],
    expires : object.expires,
    email : object.email[0],
    password : object.password[0],
    verified : object.verified
  }
  console.log(result)
  return result
}

const postgresql = {
  insert,
  fetch,
  update,
  deleteData
}

module.exports = postgresql
