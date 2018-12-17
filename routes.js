const express = require('express')
const router = express.Router()

const performValidations = require('./controllers/validateEmailAndPassword')
const hashPasswordAndStoreInDB = require('./controllers/hashPasswordAndStoreInDB')
const authenticateTheUser = require('./controllers/authenticateTheUser')
const handleDB = require('./controllers/handleDB')

router.use('/verifyUser', performValidations)

//Cross check if user has already registered
router.use('/verifyUser', handleDB.checkIfUserRegistered)

router.post('/verifyUser', hashPasswordAndStoreInDB)

//When the user clicks the verification link, update his/her status in DB
router.get('/verifyMe/:token', handleDB.updateUsersVerifiedStatus)

router.use('/authenticateUser', performValidations)
router.post('/authenticateUser', authenticateTheUser)

module.exports = router
