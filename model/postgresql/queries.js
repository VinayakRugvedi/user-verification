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

const queries = {
  insertUserData,
  fetchUserData,
  updateVerifiedStatus,
  deleteUserData
}

module.exports = queries
