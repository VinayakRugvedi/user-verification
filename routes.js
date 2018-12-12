const express = require('express')
const router = express.Router()

const mailgunConfig = require('./config')()
const mailgun = require('mailgun-js')(mailgunConfig)

const cryptoRandomString = require('crypto-random-string')

router.use((req, res, next) => {
  console.log(req.body)
  //Validating the body which contains email and password before moving ahead
  next()
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
      res.status(err.statusCode).end()
    } else {
      console.log(body)
      res.status(201).end()
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
