const express = require('express')

const mailgunConfig = require('./config.js')()
const mailgun = require('mailgun-js')(mailgunConfig)

const app = express()

var data = {
  from : 'Anonymous <me@samples.mailgun.org>',
  to : 'vinayakrugvedi@gmail.com', //Only one authorized recipient
  subject : 'Verifying You!',
  html: `<p>Click the below link to verify : </p>
         <a href="https://www.google.com">Click Here!</a>`
}

const port = process.env.port || 5000

app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))

app.post('/userVerify', (req, res) => {
  mailgun.messages().send(data, (err, resBody) => {
    if(err) {
      console.log(err)
      res.status(err.statusCode).end()
    } else {
      console.log(resBody)
      res.status(201).end()
    }
  })
})

app.listen(port, () => {
  console.log(`SERVER : Listening on port ${port}`)
})
