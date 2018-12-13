const mailgunConfig = require('./config')()
const mailgun = require('mailgun-js')(mailgunConfig)

function sendVerificationLink(email, token, res) {

  let data = {
    from : 'Anonymous <me@mailgun.sample.org>',
    to : `${email}`,
    subject : 'Verifying You!',
    html : `<p>Click the below link to verify yourself : </p>
            <a href="http://localhost:5000/verifyMe/${token}">
               http://localhost:5000/verifyMe/${token}</a>`
  }

  mailgun.messages().send(data, (err, body) => {
    if(err) {
      console.log(err)

      res.status(err.statusCode).json({
        status : "Your data is securely stored but coudn't send the mail!; Try again..."
      })

    } else {
      console.log(body)

      res.status(201).json({
        msg : "Your data is securely stored and the mail has been successfully sent; Check your inbox/spam"
      })

    }
  })
}

module.exports = sendVerificationLink
