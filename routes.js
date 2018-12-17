const express = require('express')
const router = express.Router()
const performValidations = require('./controllers/validateEmailAndPassword')
const hashPasswordAndStoreInDB = require('./controllers/hashPasswordAndStoreInDB')

const handleDB = require('./handleDB')

router.use('/verifyUser', performValidations)

router.use('/verifyUser', (req, res, next) => {
  //Cross check if user has already registered
  handleDB.preCheck(req.body.email, res, next) //cb
})

router.post('/verifyUser', hashPasswordAndStoreInDB)

router.get('/verifyMe/:token', (req, res) => {
  //When the user clicks the verification link, update his/her status in DB
  console.log(req.params.token)
  handleDB.fetch(req.params.token, res)
})

module.exports = router
