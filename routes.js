const express = require('express')
const router = express.Router()

const sendVerificationLink = require('./sendVerificationLink')

const cryptoRandomString = require('crypto-random-string')
const validator = require('validator')
const bcrypt = require('bcryptjs')

router.use('/userVerify', (req, res, next) => {
  console.log(req.body)
  //Validating the body which contains email and password before moving ahead
  //Basic validation
  if( !validator.isEmpty(req.body.email) && validator.isEmail(req.body.email)) {
    if( !validator.isEmpty(req.body.password) && !validator.isEmpty(req.body.confirmedPassword) ) {
      if(validator.isLength(req.body.password, {min : 8, max : 25})
         && validator.isLength(req.body.confirmedPassword, {min : 8, max : 25})) {
           if(validator.equals(req.body.password, req.body.confirmedPassword)) {
             next() //Move on to handling the respecive route
           } else {
             res.status(400).json({
               msg : 'The passwords do not match'
             })
           }
         } else {
           res.status(400).json({
             msg : 'The length of password should be in the range of 8 - 25'
           })
         }
    } else {
      res.status(400).json({
        msg : 'Either of the password field is empty!'
      })
    }
  } else {
    res.status(400).json({
      msg : 'The email is either empty or not in the right format!'
    })
  }
})

router.post('/userVerify', (req, res) => {

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

    //Upon successfull validation and storing, send a verification link to user
    sendVerificationLink(req.body.email, token, res)
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
  //Using Date.now() - No of ms since Jan 1, 1970
  res.json({
    status : 'You are verified'
  })
})

module.exports = router
