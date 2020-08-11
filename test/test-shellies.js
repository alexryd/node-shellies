/* eslint-env mocha */
const should = require('should')
const sinon = require('sinon')

const devices = require('../lib/devices')
const shellies = require('../index')
const UnknownDevice = require('../lib/devices/unknown')

describe('shellies', function() {
  let device = null

  beforeEach(function() {
    device = shellies.createDevice('SHSW-1', 'ABC123', '192.168.1.2')
  })

  afterEach(function() {
    shellies._devices.clear()
    shellies.removeAllListeners()
  })

  it('should emit `start` when the status listener starts', function() {
    const startHandler = sinon.fake()
    shellies.on('start', startHandler)

    shellies._listener.emit('start')
    startHandler.calledOnce.should.equal(true)
  })

  it('should emit `stop` when the status listener stops', function() {
    const stopHandler = sinon.fake()
    shellies.on('stop', stopHandler)

    shellies._listener.emit('stop')
    stopHandler.calledOnce.should.equal(true)
  })

  it('should emit `discover` when a new device is found', function() {
    const discoverHandler = sinon.fake()
    shellies.on('discover', discoverHandler)

    const msg = {
      deviceType: 'SHSW-1',
      deviceId: 'ABC123',
      host: '192.168.1.2',
    }
    shellies._listener.emit('statusUpdate', msg)

    discoverHandler.calledOnce.should.equal(true)
    discoverHandler.lastCall.args[0].type.should.equal(msg.deviceType)
    discoverHandler.lastCall.args[0].id.should.equal(msg.deviceId)
    discoverHandler.lastCall.args[0].host.should.equal(msg.host)
    discoverHandler.lastCall.args[1].should.be.false()

    const msg2 = {
      deviceType: 'SHSW-1',
      deviceId: 'ABC124',
      host: '192.168.1.3',
    }
    shellies._listener.emit('statusUpdate', msg2)

    discoverHandler.calledTwice.should.equal(true)
    discoverHandler.lastCall.args[0].type.should.equal(msg2.deviceType)
    discoverHandler.lastCall.args[0].id.should.equal(msg2.deviceId)
    discoverHandler.lastCall.args[0].host.should.equal(msg2.host)
    discoverHandler.lastCall.args[1].should.be.false()
  })

  it('should not emit `discover` when a known device is found', function() {
    const discoverHandler = sinon.fake()
    shellies.on('discover', discoverHandler)

    shellies.addDevice(device)

    const msg = {
      deviceType: device.type,
      deviceId: device.id,
      host: device.host,
    }
    shellies._listener.emit('statusUpdate', msg)

    discoverHandler.calledOnce.should.equal(false)
  })

  it('should emit `add` when a new device is discovered', function() {
    const addHandler = sinon.fake()
    shellies.on('add', addHandler)

    const msg = {
      deviceType: 'SHSW-1',
      deviceId: 'ABC123',
      host: '192.168.1.2',
    }
    shellies._listener.emit('statusUpdate', msg)

    addHandler.calledOnce.should.equal(true)
  })

  it('should emit `discover` when an unknown device type is found', function() {
    const discoverHandler = sinon.fake()
    shellies.on('discover', discoverHandler)

    const msg = {
      deviceType: 'UNKNOWN-1',
      deviceId: 'ABC123',
      host: '192.168.1.2',
    }
    shellies._listener.emit('statusUpdate', msg)

    discoverHandler.calledOnce.should.equal(true)
    discoverHandler.lastCall.args[0].should.be.instanceof(UnknownDevice)
    discoverHandler.lastCall.args[1].should.be.true()
  })

  it('should not emit `stale` when `staleTimeout` is disabled', function() {
    const clock = sinon.useFakeTimers()
    const staleHandler = sinon.fake()
    const deviceStaleHandler = sinon.fake()
    shellies.on('stale', staleHandler)
    device.on('stale', deviceStaleHandler)

    shellies.staleTimeout = 0
    device.online = true
    shellies.addDevice(device)
    device.online = false

    staleHandler.called.should.equal(false)
    clock.tick(99999999999)
    staleHandler.calledOnce.should.equal(false)
    deviceStaleHandler.calledOnce.should.equal(false)

    clock.restore()
  })

  it('should emit `stale` when a device becomes stale', function() {
    const clock = sinon.useFakeTimers()
    const staleHandler = sinon.fake()
    const deviceStaleHandler = sinon.fake()
    shellies.on('stale', staleHandler)
    device.on('stale', deviceStaleHandler)

    shellies.staleTimeout = 1000
    device.online = true
    shellies.addDevice(device)
    device.online = false

    staleHandler.called.should.equal(false)
    clock.tick(shellies.staleTimeout)
    staleHandler.calledOnce.should.equal(true)
    staleHandler.calledWith(device).should.equal(true)
    deviceStaleHandler.calledOnce.should.equal(true)
    deviceStaleHandler.calledWith(device).should.equal(true)

    clock.restore()
  })

  it('should emit `stale` for devices that are already offline', function() {
    const clock = sinon.useFakeTimers()
    const staleHandler = sinon.fake()
    shellies.on('stale', staleHandler)

    shellies.staleTimeout = 1000
    shellies.addDevice(device)

    staleHandler.called.should.be.false()
    clock.tick(shellies.staleTimeout)
    staleHandler.calledOnce.should.be.true()
    staleHandler.calledWith(device).should.be.true()

    clock.restore()
  })

  it('should remove stale devices', function() {
    const clock = sinon.useFakeTimers()
    const removeHandler = sinon.fake()
    shellies.on('remove', removeHandler)

    shellies.staleTimeout = 1000
    shellies.addDevice(device)
    device.emit('offline', device)

    shellies.size.should.equal(1)
    clock.tick(shellies.staleTimeout)
    shellies.size.should.equal(0)
    removeHandler.calledOnce.should.equal(true)
    removeHandler.calledWith(device).should.equal(true)

    clock.restore()
  })

  it('should not emit `stale` for devices that are online', function() {
    const clock = sinon.useFakeTimers()
    const staleHandler = sinon.fake()
    shellies.on('stale', staleHandler)

    shellies.staleTimeout = 1000
    device.online = true
    shellies.addDevice(device)
    device.online = false
    device.online = true

    staleHandler.called.should.be.false()
    clock.tick(shellies.staleTimeout)
    staleHandler.called.should.be.false()

    clock.restore()
  })

  describe('#start()', function() {
    it(
      'should pass the network interface to the status update listener',
      function() {
        const start = sinon.stub(shellies._listener, 'start')
        const networkInterface = '127.0.0.1'

        shellies.start(networkInterface)

        start.calledOnce.should.be.true()
        start.calledWith(networkInterface).should.be.true()
      }
    )
  })

  describe('#addDevice()', function() {
    it('should add the device to the list of devices', function() {
      shellies.size.should.equal(0)
      shellies.addDevice(device)
      shellies.size.should.equal(1)
    })

    it('should emit an `add` event', function() {
      const addHandler = sinon.fake()

      shellies.on('add', addHandler)
      shellies.addDevice(device)

      addHandler.calledOnce.should.equal(true)
      addHandler.calledWith(device).should.equal(true)
    })

    it('should throw an error when a device is added twice', function() {
      shellies.addDevice(device)

      should(() => shellies.addDevice(device)).throw()
      should(() => {
        shellies.addDevice(
          shellies.createDevice('SHSW-1', 'ABC123', '192.168.1.3')
        )
      }).throw()
    })

    it('should not throw an error when two devices are added', function() {
      shellies.addDevice(device)
      should(() => {
        shellies.addDevice(
          shellies.createDevice('SHSW-1', 'ABC124', '192.168.1.2')
        )
      }).not.throw()
    })
  })

  describe('#getDevice()', function() {
    it('should return undefined when the device is not found', function() {
      should(shellies.getDevice('SHSW-1', 'ABC123')).equal(undefined)
    })

    it('should return the device when it is found', function() {
      shellies.addDevice(device)

      shellies.getDevice(device.type, device.id).should.equal(device)
    })
  })

  describe('#hasDevice()', function() {
    it('should return false when the device is not found', function() {
      shellies.hasDevice(device).should.equal(false)
    })

    it('should return true when the device is found', function() {
      shellies.addDevice(device)

      shellies.hasDevice(device).should.equal(true)
      shellies.hasDevice(
        shellies.createDevice('SHSW-1', 'ABC123', '192.168.1.3')
      ).should.equal(true)
    })
  })

  describe('#removeDevice()', function() {
    it('should remove the device from the list of devices', function() {
      shellies.addDevice(device)
      shellies.size.should.equal(1)
      shellies.removeDevice(device)
      shellies.size.should.equal(0)
    })

    it('should remove all event listeners from the device', function() {
      shellies.addDevice(device)
      shellies.removeDevice(device)

      device.eventNames().length.should.equal(0)
    })

    it('should emit a `remove` event when a device is removed', function() {
      const removeHandler = sinon.fake()

      shellies.addDevice(device)
      shellies.on('remove', removeHandler)
      shellies.removeDevice(device)

      removeHandler.calledOnce.should.equal(true)
      removeHandler.calledWith(device).should.equal(true)
    })

    it(
      'should not emit a `remove` event when no device is removed',
      function() {
        const removeHandler = sinon.fake()

        shellies.on('remove', removeHandler)
        shellies.removeDevice(device)

        removeHandler.called.should.equal(false)
      }
    )
  })

  describe('#[Symbol.iterator]()', function() {
    it('should return an iterator', function() {
      shellies.should.be.iterable()
      shellies[Symbol.iterator]().should.be.iterator()
    })

    it('should iterate through the list of devices', function() {
      const device2 = shellies.createDevice('SHSW-1', 'ABC124', '192.168.1.3')
      const device3 = shellies.createDevice('SHSW-1', 'ABC125', '192.168.1.4')
      const iterator = shellies[Symbol.iterator]()

      shellies.addDevice(device)
      shellies.addDevice(device2)
      shellies.addDevice(device3)

      iterator.next().value.should.equal(device)
      iterator.next().value.should.equal(device2)
      iterator.next().value.should.equal(device3)
    })
  })

  describe('#setAuthCredentials()', function() {
    it('should set the authentication credentials', function() {
      const auth = sinon.fake()
      sinon.replace(shellies.request, 'auth', auth)

      shellies.setAuthCredentials('foo', 'bar')

      auth.calledOnce.should.equal(true)
      auth.calledWith('foo', 'bar').should.equal(true)
    })
  })

  describe('#isUnknownDevice()', function() {
    it('should return true for unknown devices', function() {
      shellies.isUnknownDevice(
        devices.create(
          'UNKNOWN-1',
          'ABC123',
          '192.168.1.2'
        )
      ).should.be.true()
    })

    it('should return false for known devices', function() {
      shellies.isUnknownDevice(
        devices.create(
          'SHSW-1',
          'ABC123',
          '192.168.1.2'
        )
      ).should.be.false()
    })
  })
})
