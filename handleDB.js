const {Client} = require('pg')
const connectionString = 'postgresql://vinayak:1.618033@localhost:5432/users'

const sendVerificationLink = require('./sendVerificationLink')

const client = new Client({connectionString})
client.connect()

function store(data, res) {
  const insertQuery = {
    name : 'store-user-info',
    text : 'INSERT INTO data(token, email, expires, password, verified) VALUES($1, $2, $3, $4, $5) RETURNING *',
    values : [`{${data.token}}`, `{${data.email}}`, data.expires, `{${data.password}}`, data.verified]
  }

  client.query(insertQuery, (insertErr, insertResult) => {
    if(insertErr) {
      console.log(insertErr)

      res.status(502).json({
        msg : 'Oops!, couldnt save your data in the DB; Try again...'
      })

    } else {
      console.log(insertResult.rows)

      // Upon storing, send a Verification link
      sendVerificationLink(data.email, data.token, res)
    }
  })
}

function fetch(token, res) {
  console.log(token, 'in fetch')
  const fetchQuery = {
    name : 'get-users-data',
    text : `SELECT * FROM data where token[1] = '${token}'`
  }

  client.query(fetchQuery, (fetchErr, fetchResult) => {
    if(fetchErr) {
      console.log(fetchErr)

      res.status(502).json({
        msg : 'Couldnt retrive data; Try clicking the link again after some time...'
      })

    } else {
      console.log(fetchResult.rows[0].expires)

      const updateQuery = {
        name : 'set-verified-to-true',
        text : 'UPDATE data SET verified = true WHERE id = $1 RETURNING *',
        values : [fetchResult.rows[0].id]
      }

      let isLinkValid = !isExpired(fetchResult.rows[0].expires)
      if(isLinkValid) {
        client.query(updateQuery, (updateErr, updateResult) => {
          if(updateErr) {
            console.log(updateErr)
            res.status(502).json({
              msg : 'Couldnt set data; Try clicking the link again after some time...'
            })
          } else {
            console.log(updateResult)
            res.status(201).json({
              msg : 'Congratulations, You are verified...'
            })
          }
        })
      } else {
        const deleteQuery = {
          name : 'delete-user-data',
          text : 'DELETE FROM data WHERE id = $1',
          values : [fetchResult.rows[0].id]
        }

        client.query(deleteQuery, (deleteErr, deleteResult) => {
          if(deleteErr) {
            console.log(deleteErr)
            res.status(502).json({
            msg : 'Oops!, something went wrong; Try again...'
            })
          } else {
            console.log(deleteResult)
            res.status(201).json({
            msg : 'The verification link has expired; Kindle re-register at the registration page'
            })
          }
        })
      }
    }
  })
}

function isExpired(time) {
  let currentTime = Date.now()
  return currentTime > time ? true : false
}

const handleDB = {
  store,
  fetch
}

module.exports = handleDB
