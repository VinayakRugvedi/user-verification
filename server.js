const express = require('express')

const app = express()
const routes = require('./routes')

const port = process.env.port || 5000

app.use(express.static('public'))
app.use(express.json())
app.use('/', routes)

app.listen(port, () => {
  console.log(`SERVER : Listening on port ${port}`)
})
