const express = require('express')
const router = express.Router()

const handleDB = require('./handleDB')

const cryptoRandomString = require('crypto-random-string')
const validator = require('validator')
const bcrypt = require('bcryptjs')

router.use('/verifyUser', (req, res, next) => {
  console.log(req.body)

  //Validating the body which contains email and password before moving ahead
  let validationStatus =
  validateEmailAndPassword(req.body.email, req.body.password, req.body.confirmedPassword)
  if(typeof validationStatus === 'object')
    res.status(400).json(validationStatus)
  else next()
})

function validateEmailAndPassword(email, password, confirmPassword) {
  let messageObject = {
    msg : ''
  }
  if(validator.isEmpty(email)) {
    messageObject.msg = "The email field is left empty"
    return messageObject
  }
  if(!validator.isEmail(email)) {
    messageObject.msg = "The email entered is not in the right format"
    return messageObject
  }
  return (validatePassword(password, confirmPassword))
}

function validatePassword(password, confirmPassword) {
  let messageObject = {
    msg : ''
  }
  if(validator.isEmpty(password) || validator.isEmpty(confirmPassword)) {
    messageObject.msg = "Either the password or the Confirm Password field is left empty"
    return messageObject
  }
  if(!validator.isLength(password, {min:8, max:25}) || !validator.isLength(confirmPassword, {min:8, max:25})) {
    messageObject.msg = "The length of password should be in the range of 8 - 25"
    return messageObject
  }
  if(!validator.equals(password, confirmPassword)) {
    messageObject.msg = "The passwords do not match"
    return messageObject
  }
  return true
}

router.use('/verifyUser', (req, res, next) => {
  //Cross check if user has already registered
  handleDB.preCheck(req.body.email, res, next) //cb
})

router.post('/verifyUser', (req, res) => {

  let token = cryptoRandomString(32)
  let date = new Date()
  let userData = {
    token,
    email : req.body.email,
    expires : date.setUTCHours(date.getUTCHours() + 2), //Future time in ms from Jan 1, 1970
    verified : false
  }
  //Encrypt the user data and store it in DB
  bcrypt.hash(req.body.password, 10)
  .then( hash => {
    console.log(hash) //Hashed password to be stored in db
    userData.password = hash //Store userData

    //Upon Validation and Hashing - Store
    handleDB.store(userData, res)
  })
  .catch( err => {
    console.log(err)
    res.status(500).json({
      msg : 'Couldnt securely store your password; Try Again... '
    })
  })
})

router.get('/verifyMe/:token', (req, res) => {
  //When the user clicks the verification link, update his/her status in DB
  console.log(req.params.token)
  handleDB.fetch(req.params.token, res)
})

module.exports = router
