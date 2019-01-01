const defaults = require('superagent-defaults')

const packageJson = require('../package.json')

const request = defaults()
  .set('User-Agent', `node-shellies ${packageJson.version}`)
  .timeout(10000)

module.exports = request
