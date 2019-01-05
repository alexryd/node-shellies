/* eslint-env mocha */
const should = require('should')
const sinon = require('sinon')

const shellies = require('../index')

describe('shellies', function() {
  const device = shellies.createDevice('SHSW-1', 'ABC123', '192.168.1.2')

  beforeEach(function() {
    shellies._devices.clear()
    shellies.removeAllListeners()
    device.removeAllListeners()
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

  it('should emit `unknown` when an unknown device type is found', function() {
    const unknownHandler = sinon.fake()
    shellies.on('unknown', unknownHandler)

    const msg = {
      deviceType: 'UNKNOWN-1',
      deviceId: 'ABC123',
      host: '192.168.1.2',
    }
    shellies._listener.emit('statusUpdate', msg)

    unknownHandler.calledOnce.should.equal(true)
    unknownHandler.calledWith(
      msg.deviceType,
      msg.deviceId,
      msg.host
    ).should.equal(true)
  })

  it('should emit `stale` when a device becomes stale', function() {
    const clock = sinon.useFakeTimers()
    const staleHandler = sinon.fake()
    const deviceStaleHandler = sinon.fake()
    shellies.on('stale', staleHandler)
    device.on('stale', deviceStaleHandler)

    shellies.addDevice(device)
    device.emit('offline', device)

    staleHandler.called.should.equal(false)
    clock.tick(shellies.staleTime)
    staleHandler.calledOnce.should.equal(true)
    staleHandler.calledWith(device).should.equal(true)
    deviceStaleHandler.calledOnce.should.equal(true)
    deviceStaleHandler.calledWith(device).should.equal(true)

    clock.restore()
  })

  it('should remove stale devices', function() {
    const clock = sinon.useFakeTimers()
    const removeHandler = sinon.fake()
    shellies.on('remove', removeHandler)

    shellies.addDevice(device)
    device.emit('offline', device)

    shellies.size.should.equal(1)
    clock.tick(shellies.staleTime)
    shellies.size.should.equal(0)
    removeHandler.calledOnce.should.equal(true)
    removeHandler.calledWith(device).should.equal(true)

    clock.restore()
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
})
