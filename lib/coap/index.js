const coap = require('coap')
const EventEmitter = require('eventemitter3')

const CoapMessage = require('./message')
const CoapOptions = require('./options')

const COAP_MULTICAST_ADDRESS = '224.0.1.187'

CoapOptions.register()

const agent = new coap.Agent()
// Because of a bug in Shelly devices we need to override _nextToken()
agent._nextToken = () => Buffer.alloc(0)

const Coap = {}

Coap.request = (host, pathname, opts) => {
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

Coap.getDescription = host => Coap.request(host, '/cit/d')
Coap.getStatus = host => Coap.request(host, '/cit/s')

Coap.requestUpdates = (updateHandler, timeout = 500) => {
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
        if (updateHandler) {
          updateHandler(new CoapMessage(res))
        }
      })
      .on('error', err => {
        clearTimeout(t)
        reject(err)
      })
      .end()
  })
}

Coap.listenForUpdates = (updateHandler, networkInterface) => {
  const server = coap.createServer({
    multicastAddress: COAP_MULTICAST_ADDRESS,
    multicastInterface: networkInterface,
  })

  server.on('request', req => {
    if (req.code === '0.30' && req.url === '/cit/s' && updateHandler) {
      updateHandler.call(server, new CoapMessage(req))
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

/**
 * Handles listening for updates from Shelly devices over CoAP.
 */
class Listener extends EventEmitter {
  constructor() {
    super()

    this._server = null
    this._running = false
  }

  /**
   * Whether this listener is active.
   */
  get running() {
    return this._running
  }

  /**
   * Starts listening for updates from Shelly devices. An initial request for
   * updates from all online devices will be sent.
   * @param {string} networkInterface - The network interface to listen for
   * updates on. If not specified, all available network interfaces will be
   * used.
   */
  async start(networkInterface = null) {
    if (!this._running) {
      try {
        this._running = true

        const handler = msg => {
          // ignore updates without valid device info
          if (msg.deviceType && msg.deviceId) {
            this.emit('update', msg)
          }
        }

        // request updates from all online devices
        await Coap.requestUpdates(handler)

        // start listening for updates
        this._server = await Coap.listenForUpdates(
          handler,
          networkInterface
        )

        this.emit('start')
      } catch (e) {
        this._running = false
        throw e
      }
    }
  }

  /**
   * Stops listening for updates.
   */
  stop() {
    if (this._running) {
      this._server.close()
      this._server = null
      this._running = false
      this.emit('stop')
    }
  }
}
Coap.Listener = Listener

module.exports = Coap
