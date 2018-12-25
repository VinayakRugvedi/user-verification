const express = require('express')
const router = express.Router()

const performValidations = require('./controllers/validateEmailAndPassword')
const hashPasswordAndStoreInDB = require('./controllers/hashPasswordAndStoreInDB')
const authenticateUser = require('./controllers/authenticateUser')
const handleDB = require('./controllers/handleDB')

router.use('/signUp', performValidations)

//Cross check if user has already registered
router.use('/signUp', handleDB.checkIfUserRegistered)

router.post('/signUp', hashPasswordAndStoreInDB)

//When the user clicks the verification link, update his/her status in DB
router.get('/verify/:token', handleDB.updateUsersVerifiedStatus)//me

router.use('/authenticateUser', performValidations)
router.post('/authenticateUser', authenticateUser)//the

module.exports = router
