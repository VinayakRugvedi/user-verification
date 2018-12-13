const {Client} = require('pg')
const connectionString = 'postgresql://vinayak:1.618033@localhost:5432/users'

const sendVerificationLink = require('./sendVerificationLink')

const client = new Client({connectionString})
client.connect()

function store(data, res) {
  const query = {
    name : 'store-user-info',
    text : 'INSERT INTO data(token, email, expires, password, verified) VALUES($1, $2, $3, $4, $5) RETURNING *',
    values : [`{${data.token}}`, `{${data.email}}`, data.expires, `{${data.password}}`, data.verified]
  }

  client.query(query, (err, result) => {
    if(err) {
      console.log(err)

      res.status(502).json({
        msg : 'Oops!, couldnt save your data in the DB; Try again...'
      })

    } else {
      console.log(result.rows)

      // Upon storing, send a Verification link
      sendVerificationLink(data.email, data.token, res)
    }
  })
}

function fetch(token, res) {
  console.log(token, 'in fetch')
  const query = {
    name : 'get-users-data',
    text : `SELECT * FROM data where token[1] = '${token}'`
  }

  client.query(query, (err, result) => {
    if(err) {
      console.log(err)

      res.status(502).json({
        msg : 'Couldnt retrive data; Try clicking the link again after some time...'
      })

    } else {
      console.log(result.rows[0].expires)

      const updateQuery = {
        name : 'set-verified-to-true',
        text : 'UPDATE data SET verified = true WHERE id = $1 RETURNING *',
        values : [result.rows[0].id]
      }

      client.query(updateQuery, (err, result) => {
        if(err) {
          console.log(err)
          res.status(502).json({
            msg : 'Couldnt set data; Try clicking the link again after some time...'
          })
        } else {
          console.log(result)
          res.status(201).json({
            status : 'Congratulations, You are verified...'
          })
        }
      })

    }
  })
}

const handleDB = {
  store,
  fetch
}

module.exports = handleDB
