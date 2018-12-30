/* eslint-env mocha */
const should = require('should')
const sinon = require('sinon')

const shellies = require('../index')

describe('shellies', function() {
  const device = shellies.createDevice('SHSW-1', 'ABC123', '192.168.1.2')

  beforeEach(function() {
    shellies._devices.clear()
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
    it('should be an iterator', function() {
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
})
