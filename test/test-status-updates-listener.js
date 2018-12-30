/* eslint-env mocha */
const sinon = require('sinon')

const coap = require('../lib/coap')
const StatusUpdatesListener = require('../lib/status-updates-listener')

describe('StatusUpdatesListener', function() {
  const fakeServer = { close: () => {} }
  let listener = null

  beforeEach(function() {
    sinon.stub(coap, 'listenForStatusUpdates').resolves(fakeServer)
    sinon.stub(coap, 'requestStatusUpdates').resolves()
    sinon.stub(fakeServer, 'close')

    listener = new StatusUpdatesListener()
  })

  afterEach(function() {
    sinon.restore()
    listener.removeAllListeners()
    listener = null
  })

  describe('#start()', function() {
    it('emits `start`', async function() {
      const startHandler = sinon.fake()
      listener.on('start', startHandler)

      await listener.start()

      startHandler.calledOnce.should.equal(true)
    })

    it('sets `listening` to true', async function() {
      listener.listening.should.equal(false)
      await listener.start()
      listener.listening.should.equal(true)
    })

    it('handles updates from requestStatusUpdates()', async function() {
      const statusUpdateHandler = sinon.fake()
      listener.on('statusUpdate', statusUpdateHandler)

      const msg = {
        deviceType: 'SHSW-1',
        deviceId: 'ABC123',
        host: '192.168.1.2',
      }
      coap.requestStatusUpdates.callsArgWith(0, msg)

      await listener.start()

      statusUpdateHandler.calledOnce.should.equal(true)
      statusUpdateHandler.calledWith(msg).should.equal(true)
    })

    it('handles errors from requestStatusUpdates()', function() {
      const err = new Error('Fake error')
      coap.requestStatusUpdates.rejects(err)

      return listener.start().should.be.rejectedWith(err)
    })

    it('handles updates from listenForStatusUpdates()', async function() {
      const statusUpdateHandler = sinon.fake()
      listener.on('statusUpdate', statusUpdateHandler)

      const msg = {
        deviceType: 'SHSW-1',
        deviceId: 'ABC123',
        host: '192.168.1.2',
      }
      coap.listenForStatusUpdates.callsArgWith(0, msg)

      await listener.start()

      statusUpdateHandler.calledOnce.should.equal(true)
      statusUpdateHandler.calledWith(msg).should.equal(true)

      coap.listenForStatusUpdates.firstCall.args[0](msg)

      statusUpdateHandler.calledTwice.should.equal(true)
      statusUpdateHandler.calledWith(msg).should.equal(true)
    })

    it('handles errors from listenForStatusUpdates()', function() {
      const err = new Error('Fake error')
      coap.listenForStatusUpdates.rejects(err)

      return listener.start().should.be.rejectedWith(err)
    })

    it('does nothing when already listening', async function() {
      await listener.start()
      await listener.start()

      coap.listenForStatusUpdates.calledOnce.should.equal(true)
      coap.requestStatusUpdates.calledOnce.should.equal(true)
    })
  })

  describe('#stop()', function() {
    it('stops the server', async function() {
      await listener.start()
      listener.stop()

      fakeServer.close.calledOnce.should.equal(true)
    })

    it('emits `stop`', async function() {
      const stopHandler = sinon.fake()
      listener.on('stop', stopHandler)

      await listener.start()
      listener.stop()

      stopHandler.calledOnce.should.equal(true)
    })

    it('sets `listening` to false', async function() {
      await listener.start()

      listener.listening.should.equal(true)
      listener.stop()
      listener.listening.should.equal(false)
    })

    it('does nothing when not listening', async function() {
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
