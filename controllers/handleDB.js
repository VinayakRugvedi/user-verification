const config = require('../config')

const dataBase = require(`../model/${config.dataBaseConfiguration.dataBase}`)
const sendVerificationLink = require('./sendVerificationLink')

async function storeUserDataInDB(userData, res) {
  let insertResult = await dataBase.insert(userData)
  if(insertResult === undefined) {
    res.status(502).json({
      msg : 'Oops!, couldnt save your data in the DB; Try again...'
    })
  } else {
    console.log(insertResult);
    // Upon storing, send a Verification link
    sendVerificationLink(userData.email, userData.token, res)
  }
}

async function checkIfUserRegistered(req, res, next) {
  let fetchResult = await dataBase.fetch('email', req.body.email)
  if(fetchResult === undefined) {
    res.status(502).json({
    msg : 'Oops!, something went wrong; Try again...'
    })
  } else {
      if(Object.keys(fetchResult).length === 0) next()
      else if(!fetchResult.verified) {
      //Hasnt verified yet *eg:data stored on db but email sending fails
      sendVerificationLink(fetchResult.email, fetchResult.token, res)
      }
      else
        res.status(201).json({
          msg : 'You have already been verified - Just Sign Up with the credentials'
        })
    }
}

async function updateUsersVerifiedStatus(req, res, next) {
  let fetchResult =
  await dataBase.fetch('token', req.params.token)
  if(fetchResult === undefined) {
    res.status(502).json({
      msg : 'Couldnt retrive data; Try clicking the link again after some time...'
    })
  } else {
    if(Object.keys(fetchResult).length === 0)
      res.status(200).json({
        msg : 'This link is invalid and we dont have your data, kindle sign up again!'
      })
    else await takeActionBasedOnLinkExpiration(fetchResult, res)
         .catch((error) => console.log(error))
  }
}

async function takeActionBasedOnLinkExpiration(fetchResult, res) {
  let isLinkValid =
  await isExpired(fetchResult.expires, fetchResult._id, res)
  if(!isLinkValid) {
    let updateResult = await dataBase.update(fetchResult._id)
    if(updateResult === undefined)
      res.status(502).json({
        msg : 'Couldnt set data; Try clicking the link again after some time...'
      })
    else {
      res.status(201).json({
        msg : 'Congratulations, You are verified...'
      })
    }
  }
}

//Delete the users data if the verification link has expired
async function isExpired(time, id, res) {
  let currentTime = Date.now()
  if(currentTime > time) {
    let deleteResult = await dataBase.deleteData(id)
    if(deleteResult === undefined)
      res.status(502).json({
        msg : 'Oops!, something went wrong; Try again...'
      })
    else {
      res.status(201).json({
      msg : 'The verification link has expired; Kindle re-register at the registration page'
      })
    }
  }
  else return false
}

async function getHashIfAvailableAndAuthenticate(email, res) {
  let fetchResult = await dataBase.fetch('email', email)
  if(fetchResult === undefined)
    res.status(502).json({
    msg : 'Couldnt retrive data; Try again after some time...'
    })
  else {
    if(Object.keys(fetchResult).length === 0)
      res.status(201).json({
        msg : "Looks like you havent created an account yet; Create one soon"
      })
    else if(!fetchResult.verified)
      res.status(201).json({
        msg : "Your account has not been verified yet!; Check your inbox or spam folder..."
      })
    else return fetchResult.password
  }
}

const handleDB = {
  storeUserDataInDB,
  checkIfUserRegistered,
  updateUsersVerifiedStatus,
  getHashIfAvailableAndAuthenticate
}

module.exports = handleDB
