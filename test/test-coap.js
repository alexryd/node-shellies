/* eslint-env mocha */
const sinon = require('sinon')

const Coap = require('../lib/coap')

describe('Coap.Listener', function() {
  const fakeServer = { close: () => {} }
  let listener = null

  beforeEach(function() {
    sinon.stub(Coap, 'listenForUpdates').resolves(fakeServer)
    sinon.stub(Coap, 'requestUpdates').resolves()
    sinon.stub(fakeServer, 'close')

    listener = new Coap.Listener()
  })

  afterEach(function() {
    sinon.restore()
    listener.removeAllListeners()
    listener = null
  })

  describe('#start()', function() {
    it(
      'should pass the network interface to listenForUpdates()',
      async function() {
        const networkInterface = '127.0.0.1'
        await listener.start(networkInterface)
        Coap.listenForUpdates.firstCall.args[1]
          .should.equal(networkInterface)
      }
    )

    it('should emit a `start` event', async function() {
      const startHandler = sinon.fake()
      listener.on('start', startHandler)

      await listener.start()

      startHandler.calledOnce.should.equal(true)
    })

    it('should set `running` to true', async function() {
      listener.running.should.equal(false)
      await listener.start()
      listener.running.should.equal(true)
    })

    it('should handle updates from requestUpdates()', async function() {
      const updateHandler = sinon.fake()
      listener.on('update', updateHandler)

      const msg = {
        deviceType: 'SHSW-1',
        deviceId: 'ABC123',
        host: '192.168.1.2',
      }
      Coap.requestUpdates.callsArgWith(0, msg)

      await listener.start()

      updateHandler.calledOnce.should.equal(true)
      updateHandler.calledWith(msg).should.equal(true)
    })

    it(
      'should ignore invalid updates from requestUpdates()',
      async function() {
        const updateHandler = sinon.fake()
        listener.on('update', updateHandler)

        const msg = {}
        Coap.requestUpdates.callsArgWith(0, msg)

        await listener.start()

        updateHandler.calledOnce.should.equal(false)
      }
    )

    it('should handle errors from requestUpdates()', function() {
      const err = new Error('Fake error')
      Coap.requestUpdates.rejects(err)

      return listener.start().should.be.rejectedWith(err)
    })

    it('should handle updates from listenForUpdates()', async function() {
      const updateHandler = sinon.fake()
      listener.on('update', updateHandler)

      const msg = {
        deviceType: 'SHSW-1',
        deviceId: 'ABC123',
        host: '192.168.1.2',
      }
      Coap.listenForUpdates.callsArgWith(0, msg)

      await listener.start()

      updateHandler.calledOnce.should.equal(true)
      updateHandler.calledWith(msg).should.equal(true)

      Coap.listenForUpdates.firstCall.args[0](msg)

      updateHandler.calledTwice.should.equal(true)
      updateHandler.calledWith(msg).should.equal(true)
    })

    it(
      'should ignore invalid updates from listenForUpdates()',
      async function() {
        const updateHandler = sinon.fake()
        listener.on('update', updateHandler)

        const msg = {}
        Coap.listenForUpdates.callsArgWith(0, msg)

        await listener.start()

        updateHandler.calledOnce.should.equal(false)
      }
    )

    it('should handle errors from listenForUpdates()', function() {
      const err = new Error('Fake error')
      Coap.listenForUpdates.rejects(err)

      return listener.start().should.be.rejectedWith(err)
    })

    it('should do nothing when already running', async function() {
      await listener.start()
      await listener.start()

      Coap.listenForUpdates.calledOnce.should.equal(true)
      Coap.requestUpdates.calledOnce.should.equal(true)
    })
  })

  describe('#stop()', function() {
    it('should stop the server', async function() {
      await listener.start()
      listener.stop()

      fakeServer.close.calledOnce.should.equal(true)
    })

    it('should emit a `stop` event', async function() {
      const stopHandler = sinon.fake()
      listener.on('stop', stopHandler)

      await listener.start()
      listener.stop()

      stopHandler.calledOnce.should.equal(true)
    })

    it('should set `running` to false', async function() {
      await listener.start()

      listener.running.should.equal(true)
      listener.stop()
      listener.running.should.equal(false)
    })

    it('should do nothing when not running', async function() {
      const stopHandler = sinon.fake()
      listener.on('stop', stopHandler)

      listener.stop()

      stopHandler.called.should.equal(false)

      await listener.start()
      listener.stop()
      listener.stop()

      stopHandler.calledOnce.should.equal(true)
    })
  })
})
