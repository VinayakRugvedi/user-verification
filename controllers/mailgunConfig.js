const config = require('../config')

const apiKey = config.mailgunConfiguration.apiKey
const domain = config.mailgunConfiguration.domain

function mailgunConfig() {
  return ({
    apiKey,
    domain
  })
}

module.exports = mailgunConfig
