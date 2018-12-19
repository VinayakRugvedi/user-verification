const postgresql = require('../model/postgresql')
const sendVerificationLink = require('./sendVerificationLink')

async function storeUserDataInDB(data, res) {
  let insertResult = await postgresql.insert(data)
  if(insertResult === undefined) {
    res.status(502).json({
      msg : 'Oops!, couldnt save your data in the DB; Try again...'
    })
  } else {
    console.log(insertResult.rows)
    // Upon storing, send a Verification link
    sendVerificationLink(data.email, data.token, res)
  }
}

async function checkIfUserRegistered(req, res, next) {
  let fetchResult = await postgresql.fetch('email', req.body.email)
  if(fetchResult === undefined) {
    res.status(502).json({
    msg : 'Oops!, something went wrong; Try again...'
    })
  } else {
    console.log(fetchResult.rows)
      if(fetchResult.rows.length === 0) next()
      else if(!fetchResult.rows[0].verified)
        //Hasnt verified yet *eg:data stored on db but email sending fails
      sendVerificationLink(fetchResult.rows[0].email[0], fetchResult.rows[0].token[0], res)
      else
        res.status(201).json({
          msg : 'You have already been verified - Just Sign Up with the credentials'
        })
    }
}

async function updateUsersVerifiedStatus(req, res, next) {
  console.log(req.params.token)
  let fetchResult =
  await postgresql.fetch('token', req.params.token)
  if(fetchResult === undefined) {
    res.status(502).json({
      msg : 'Couldnt retrive data; Try clicking the link again after some time...'
    })
  } else {
    console.log(fetchResult.rows, 'Verification')
    let isLinkValid =
    await isExpired(fetchResult.rows[0].expires, fetchResult.rows[0].id, res)
    if(!isLinkValid) {
      let updateResult = await postgresql.update(fetchResult.rows[0].id)
      if(updateResult === undefined)
        res.status(502).json({
          msg : 'Couldnt set data; Try clicking the link again after some time...'
        })
      else {
        console.log(updateResult)
        res.status(201).json({
          msg : 'Congratulations, You are verified...'
        })
      }
    }
  }
}

//Delete the users data if the verification link has expired
async function isExpired(time, id, res) {
  let currentTime = Date.now()
  if(currentTime > time) {
    let deleteResult = await postgresql.deleteData(id)
    if(deleteResult === undefined)
      res.status(502).json({
        msg : 'Oops!, something went wrong; Try again...'
      })
    else {
      console.log(deleteResult)
      res.status(201).json({
      msg : 'The verification link has expired; Kindle re-register at the registration page'
      })
    }
  }
  else return false
}

async function getHashIfAvailable(email, res) {
  let fetchResult = await postgresql.fetch('email', email)
  if(fetchResult === undefined)
    res.status(502).json({
    msg : 'Couldnt retrive data; Try again after some time...'
    })
  else {
    console.log(fetchResult.rows)
    if(fetchResult.rows.length === 0)
      res.status(201).json({
        msg : "Looks like you havent created an account yet; Create one soon"
      })
    else if(!fetchResult.rows[0].verified)
      res.status(201).json({
        msg : "Your account has not been verified yet!; Check your inbox or spam folder..."
      })
    else return fetchResult.rows[0].password[0]
  }
}

const handleDB = {
  storeUserDataInDB,
  checkIfUserRegistered,
  updateUsersVerifiedStatus,
  getHashIfAvailable
}

module.exports = handleDB
