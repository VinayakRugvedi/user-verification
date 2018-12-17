const cryptoRandomString = require('crypto-random-string')
const bcrypt = require('bcrypt')

const handleDB = require('./handleDB')

function hashPasswordAndStoreInDB(req, res, next) {
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
    handleDB.storeUserDataInDB(userData, res)
  })
  .catch( err => {
    console.log(err)
    res.status(500).json({
      msg : 'Couldnt securely store your password; Try Again... '
    })
  })
}

module.exports = hashPasswordAndStoreInDB
