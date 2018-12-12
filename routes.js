const express = require('express')
const router = express.Router()

const mailgunConfig = require('./config')()
const mailgun = require('mailgun-js')(mailgunConfig)

const cryptoRandomString = require('crypto-random-string')
const validator = require('validator')

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
  let userData = {
    token,
    email : req.body.email,
    password : req.body.password,
    expires : 1,
    verified : false
  }
  //Encrypt the user data and store it in DB

  //Upon successfull validation and storing, send a verification link to user
  let data = {
    from : 'Anonymous <me@mailgun.sample.org>',
    to : `${req.body.email}`,
    subject : 'Verifying You!',
    html : `<p>Click the below link to verify yourself : </p>
            <a href="http://localhost:5000/verifyMe/${token}">
               http://localhost:5000/verifyMe/${token}</a>`
  }

  mailgun.messages().send(data, (err, body) => {
    if(err) {
      console.log(err)
      res.status(err.statusCode).json({
        status : "Coudn't send the mail!; Retry again..."
      })
    } else {
      console.log(body)
      res.status(201).json({
        status : "The mail has been successfully sent; Check your inbox/spam"
      })
    }
  })
})

router.get('/verifyMe/:token', (req, res) => {
  //When the user clicks the verification link, update his/her status in DB
  console.log(req.params.token)
  res.json({
    status : 'You are verified'
  })
})

module.exports = router
