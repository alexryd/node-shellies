const defaults = require('superagent-defaults')

const packageJson = require('../../package.json')

const request = defaults()
  // set the user agent
  .set('User-Agent', `node-shellies ${packageJson.version}`)
  // set a default timeout to 10 seconds
  .timeout(10000)

module.exports = {
  request,
}
