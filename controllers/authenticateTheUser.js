const bcrypt = require('bcrypt')

const handleDB = require('./handleDB')

async function authenticateTheUser(req, res, next) {
  let hash = await handleDB.getHashIfAvailableAndAuthenticate(req.body.email, res)
  if(hash) compare(hash, req, res)
}

function compare(hash, req, res) {
  bcrypt.compare(req.body.password, hash, (err, result) => {
    if(err) {
      console.log(err)
      res.status(500).json({
        msg : "Oops!, something went wrong; Try again..."
      })
    } else {
      console.log(result)
      if(result) //result is boolean
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

module.exports = authenticateTheUser
