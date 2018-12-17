const express = require('express')
const router = express.Router()
const controllers = require('./controllers/validateEmailAndPassword')

const handleDB = require('./handleDB')

const cryptoRandomString = require('crypto-random-string')
// const validator = require('validator')
const bcrypt = require('bcrypt')

router.use('/verifyUser', controllers.performValidations)

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
