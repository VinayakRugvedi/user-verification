const bcrypt = require('bcrypt')

const handleDB = require('./handleDB')

function authenticateTheUser(req, res, next) {
  console.log(req.body)
  function compare(hash) {
    bcrypt.compare(req.body.password, hash, (err, result) => {
      if(err) {
        console.log(err)
        res.status(500).json({
          msg : "Oops!, something went wrong; Try again..."
        })
      } else {
        console.log(result)
        if(result)
          res.status(201).json({
            msg : "You have been successfully authenticated"
          })
        else
          res.status(401).json({
            msg : "Your credentials seems to be incorrect!"
          })
      }
    })
  }
  handleDB.getHashIfAvailable(req.body.email, compare, res)
}

module.exports = authenticateTheUser
