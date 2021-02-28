const coap = require('coap')

const CoapMessage = require('./message')
const CoapOptions = require('./options')

const COAP_MULTICAST_ADDRESS = '224.0.1.187'

CoapOptions.register()

const agent = new coap.Agent()
// Because of a bug in Shelly devices we need to override _nextToken()
agent._nextToken = () => Buffer.alloc(0)

const request = (host, pathname, opts) => {
  return new Promise((resolve, reject) => {
    coap.request(
      Object.assign({
        host,
        pathname,
        agent,
      }, opts)
    )
      .on('response', res => {
        resolve(new CoapMessage(res))
      })
      .on('error', err => {
        reject(err)
      })
      .end()
  })
}

const getDescription = host => request(host, '/cit/d')
const getStatus = host => request(host, '/cit/s')

const requestStatusUpdates = (statusUpdateHandler, timeout = 500) => {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, timeout + 10)

    coap.request({
      host: COAP_MULTICAST_ADDRESS,
      method: 'GET',
      pathname: '/cit/s',
      multicast: true,
      multicastTimeout: timeout,
      agent,
    })
      .on('response', res => {
        if (statusUpdateHandler) {
          statusUpdateHandler(new CoapMessage(res))
        }
      })
      .on('error', err => {
        clearTimeout(t)
        reject(err)
      })
      .end()
  })
}

const listenForStatusUpdates = (statusUpdateHandler, networkInterface) => {
  const server = coap.createServer({
    multicastAddress: COAP_MULTICAST_ADDRESS,
    multicastInterface: networkInterface,
  })

  // insert our own middleware right before requests are handled (the last step)
  server._middlewares.splice(
    Math.max(server._middlewares.length - 1, 0),
    0,
    (req, next) => {
      // Unicast messages from Shelly devices will have the 2.05 code, which the
      // server will silently drop (since its a response code and not a request
      // code). To avoid this, we change it to 0.30 here.
      if (req.packet.code === '2.05') {
        req.packet.code = '0.30'
      }
      next()
    }
  )

  server.on('request', req => {
    if (req.code === '0.30' && req.url === '/cit/s' && statusUpdateHandler) {
      statusUpdateHandler.call(server, new CoapMessage(req))
    }
  })

  return new Promise((resolve, reject) => {
    server.listen(err => {
      if (err) {
        reject(err, server)
      } else {
        resolve(server)
      }
    })
  })
}

module.exports = {
  getDescription,
  getStatus,
  listenForStatusUpdates,
  requestStatusUpdates,
}
