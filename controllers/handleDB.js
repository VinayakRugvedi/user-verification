const client = require('../model/postgresql/setup')
const queries = require('../model/postgresql/queries')

const sendVerificationLink = require('./sendVerificationLink')

function storeUserDataInDB(data, res) {
  const insertQuery = queries.insertUserData(data)
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

function checkIfUserRegistered(req, res, next) {
  const fetchQuery = queries.fetchUserData('email', req.body.email)
  console.log(fetchQuery)
  client.query(fetchQuery, (fetchErr, fetchResult) => {
    if(fetchErr) {
      console.log(fetchErr)
      res.status(502).json({
      msg : 'Oops!, something went wrong; Try again...'
      })
    }
    else {
      if(fetchResult.rows.length === 0) next()
      else if(!fetchResult.rows[0].verified) {
        //Hasnt verified yet *eg:data stored on db but email sending fails
        sendVerificationLink(fetchResult.rows[0].email[0], fetchResult.rows[0].token[0], res)
      } else {
        res.status(201).json({
          msg : 'You have already been verified - Just Sign Up with the credentials'
        })
      }
    }
  })
}

function updateUsersVerifiedStatus(req, res, next) {
  const fetchQuery = queries.fetchUserData('token', req.params.token)
  console.log(req.params.token, 'in fetch')

  client.query(fetchQuery, (fetchErr, fetchResult) => {
    if(fetchErr) {
      console.log(fetchErr)
      res.status(502).json({
        msg : 'Couldnt retrive data; Try clicking the link again after some time...'
      })
    } else {
      console.log(fetchResult.rows[0].expires)
      const updateQuery = queries.updateVerifiedStatus(fetchResult.rows[0].id)

      //Checking whether the verification link is still valid or not to update verified status
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
      }
    }
  })
}

function isExpired(time) {
  let currentTime = Date.now()
  if(currentTime > time) {
    const deleteQuery = queries.deleteUserData(fetchResult.rows[0].id)

    //Delete the users data if the verification link has expired
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
  } else return false
}

function getHashIfAvailable(email, compare, res) {
  const fetchQuery = queries.fetchUserData('email', email)
  console.log(fetchQuery)

  client.query(fetchQuery, (fetchErr, fetchResult) => {
    if(fetchErr) {
      console.log(fetchErr)
      res.status(502).json({
      msg : 'Couldnt retrive data; Try again after some time...'
      })
    } else {
      console.log(fetchResult.rows[0])
      if(fetchResult.rows.length === 0)
        res.status(201).json({
          msg : "Looks like you havent created an account yet; Create one soon"
        })
      else compare(fetchResult.rows[0].password[0])
    }
  })
}

const handleDB = {
  storeUserDataInDB,
  checkIfUserRegistered,
  updateUsersVerifiedStatus,
  getHashIfAvailable
}

module.exports = handleDB
