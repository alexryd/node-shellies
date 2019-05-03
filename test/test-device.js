/* eslint-env mocha */
const should = require('should')
const sinon = require('sinon')

const { Device, UnknownDevice } = require('../lib/device')
const request = require('../lib/http-request')

describe('Device', function() {
  let device = null

  beforeEach(function() {
    device = new Device('SHSW-1', 'ABC123', '192.168.1.2')
  })

  describe('.deviceTypeToClass()', function() {
    it('should return classes for known device types', function() {
      Device.deviceTypeToClass('SHSW-1').should.be.Function()
      Device.deviceTypeToClass('SHSW-21').should.be.Function()
    })

    it('should return UnknownDevice for unknown device types', function() {
      Device.deviceTypeToClass('UNKNOWN-1').should.equal(UnknownDevice)
    })
  })

  describe('.create()', function() {
    it('should return instances of Device for known device types', function() {
      Device.create(
        'SHSW-1',
        'ABC123',
        '192.168.1.2'
      ).should.be.instanceof(Device)
    })

    it('should return an UnknownDevice for unknown device types', function() {
      Device.create(
        'UNKNOWN-1',
        'ABC123',
        '192.168.1.2'
      ).should.be.instanceof(UnknownDevice)
    })
  })

  describe('.isUnknown()', function() {
    it('should return true for unknown devices', function() {
      Device.isUnknown(
        Device.create(
          'UNKNOWN-1',
          'ABC123',
          '192.168.1.2'
        )
      ).should.be.true()
    })

    it('should return false for known devices', function() {
      Device.isUnknown(
        Device.create(
          'SHSW-1',
          'ABC123',
          '192.168.1.2'
        )
      ).should.be.false()
    })
  })

  describe('#settings', function() {
    it('should not fail when assigned a new value', function() {
      const settings = {}
      should(() => { device.settings = settings }).not.throw()
      device.settings.should.equal(settings)
    })
  })

  describe('#online', function() {
    it('should be false by default', function() {
      device.online.should.equal(false)
    })

    it('should emit `online` and `offline` events upon changes', function() {
      const onlineHandler = sinon.fake()
      const offlineHandler = sinon.fake()
      device.on('online', onlineHandler).on('offline', offlineHandler)

      device.online = true
      onlineHandler.calledOnce.should.equal(true)
      onlineHandler.calledWith(device).should.equal(true)
      offlineHandler.called.should.equal(false)

      device.online = true
      onlineHandler.calledOnce.should.equal(true)
      offlineHandler.called.should.equal(false)

      device.online = false
      onlineHandler.calledOnce.should.equal(true)
      offlineHandler.calledOnce.should.equal(true)
      offlineHandler.calledWith(device).should.equal(true)

      device.online = false
      onlineHandler.calledOnce.should.equal(true)
      offlineHandler.calledOnce.should.equal(true)
    })
  })

  describe('#ttl', function() {
    it('should set `online` to false after the given time', function() {
      const clock = sinon.useFakeTimers()

      device.online = true
      device.ttl = 1000
      clock.tick(500)
      device.online.should.equal(true)
      clock.tick(500)
      device.online.should.equal(false)

      clock.restore()
    })

    it('should not set `online` to false when set to 0', function() {
      const clock = sinon.useFakeTimers()

      device.online = true
      device.ttl = 1000
      device.ttl = 0
      device.online.should.equal(true)
      clock.tick(1000)
      device.online.should.equal(true)

      clock.restore()
    })
  })

  describe('#name', function() {
    it('should return the name from the settings', function() {
      device.settings = { name: 'foo' }
      device.name.should.equal('foo')
    })

    it('should return undefined when no settings have been loaded', function() {
      should(device.name).be.undefined()
    })
  })

  describe('#_defineProperty()', function() {
    it('should define a property', function() {
      device._defineProperty('foo')
      device.hasOwnProperty('foo').should.equal(true)
      should(device.foo).be.null()
      device.foo = 'bar'
      device.foo.should.equal('bar')
    })

    it('should associate the property with the given ID', function() {
      device._defineProperty('foo', 1)
      device._props.get('*').get(1).should.equal('foo')
    })

    it('should not associate the property when no ID is given', function() {
      device._defineProperty('foo', null)
      device._props.size.should.equal(0)
    })

    it('should associate the property with the given mode', function() {
      device._defineProperty('foo', 1, null, null, 'bar')
      device._props.get('bar').get(1).should.equal('foo')
    })

    it('should properly set the default value', function() {
      device._defineProperty('foo', null, 'bar')
      device.foo.should.equal('bar')
    })

    it('should invoke the validator when setting a value', function() {
      const validator = val => val.toUpperCase()
      device._defineProperty('foo', null, null, validator)
      device.foo = 'bar'
      device.foo.should.equal('BAR')
    })

    it('should emit `change` events when the property changes', function() {
      const changeHandler = sinon.fake()
      const changeFooHandler = sinon.fake()
      device.on('change', changeHandler).on('change:foo', changeFooHandler)

      device._defineProperty('foo')
      device.foo = 'bar'

      changeHandler.calledOnce.should.equal(true)
      changeHandler.calledWith('foo', 'bar', null, device).should.equal(true)
      changeFooHandler.calledOnce.should.equal(true)
      changeFooHandler.calledWith('bar', null, device).should.equal(true)
    })
  })

  describe('#_getPropertyName()', function() {
    it('should return the name of the property with the given ID', function() {
      device._defineProperty('foo', 1)
      device._getPropertyName(1).should.equal('foo')
    })

    it('should return undefined for unknown IDs', function() {
      should(device._getPropertyName(1)).be.undefined()
    })

    it('should respect the given mode', function() {
      device._defineProperty('foo', 1, null, null, 'bar')
      device._getPropertyName(1, 'bar').should.equal('foo')
    })

    it('should ignore properties associated with other modes', function() {
      device._defineProperty('foo', 1, null, null, 'bar')
      should(device._getPropertyName(1, 'baz')).be.undefined()
    })
  })

  describe('#[Symbol.iterator]()', function() {
    it('should return an iterator', function() {
      device.should.be.iterable()
      device[Symbol.iterator]().should.be.iterator()
    })

    it('should iterate through properties with IDs', function() {
      device._defineProperty('foo', 1)
      device._defineProperty('bar')
      device._defineProperty('baz', 2)

      const seenProps = new Set()

      for (let [key, value] of device) { // eslint-disable-line no-unused-vars
        seenProps.add(key)
      }

      seenProps.has('foo').should.be.true()
      seenProps.has('bar').should.be.false()
      seenProps.has('baz').should.be.true()
    })

    it('should only include properties for the current mode', function() {
      device._defineProperty('foo', 1)
      device._defineProperty('bar', 2, null, null, 'mode1')
      device._defineProperty('baz', 3, null, null, 'mode2')
      device.mode = 'mode2'

      const seenProps = new Set()

      for (let [key, value] of device) { // eslint-disable-line no-unused-vars
        seenProps.add(key)
      }

      seenProps.has('foo').should.be.true()
      seenProps.has('bar').should.be.false()
      seenProps.has('baz').should.be.true()
    })
  })

  describe('#update()', function() {
    it('should set `online` to true', function() {
      device.online = false
      device.update({})
      device.online.should.equal(true)
    })

    it('should not set `ttl` when `validFor` is not specified', function() {
      device.ttl = 0
      device.update({})
      device.ttl.should.equal(0)
    })

    it('should set `ttl` when `validFor` is specified', function() {
      const msg = {
        validFor: 37,
      }

      device.ttl = 0
      device.update(msg)
      device.ttl.should.equal(msg.validFor * 1000)
    })
  })

  describe('#_applyUpdate()', function() {
    it('should update the host', function() {
      const changeHostHandler = sinon.fake()
      const msg = {
        host: '192.168.1.3',
      }

      device.on('change:host', changeHostHandler)
      device._applyUpdate(msg, [])

      changeHostHandler.calledOnce.should.equal(true)
      changeHostHandler.calledWith(msg.host).should.equal(true)
    })

    it('should update the properties from to the payload', function() {
      const changeFooHandler = sinon.fake()
      const payload = [
        [ 0, 1, 2 ],
      ]

      device._defineProperty('foo', 1)
      device.on('change:foo', changeFooHandler)
      device._applyUpdate({}, payload)

      changeFooHandler.calledOnce.should.equal(true)
      changeFooHandler.calledWith(payload[0][2]).should.equal(true)
    })
  })
})

describe('Shelly2', function() {
  let device = null

  beforeEach(function() {
    device = Device.create('SHSW-21', 'ABC123', '192.168.1.2')
  })

  afterEach(function() {
    sinon.restore()
  })

  describe('#mode', function() {
    it('should change when set to a valid mode', function() {
      should(() => { device.mode = 'roller' }).not.throw()
      device.mode.should.equal('roller')
      should(() => { device.mode = 'relay' }).not.throw()
      device.mode.should.equal('relay')
    })

    it('should throw an error when assigned an invalid mode', function() {
      should(() => { device.mode = 'foo' }).throw()
    })

    it('should invoke _updateRollerState()', function() {
      const _updateRollerState = sinon.stub(device, '_updateRollerState')
      device.mode = 'roller'
      _updateRollerState.calledOnce.should.be.true()
    })
  })

  describe('#rollerState', function() {
    it('should change when set to a valid state', function() {
      should(() => { device.rollerState = 'open' }).not.throw()
      device.rollerState.should.equal('open')
      should(() => { device.rollerState = 'close' }).not.throw()
      device.rollerState.should.equal('close')
      should(() => { device.rollerState = 'stop' }).not.throw()
      device.rollerState.should.equal('stop')
    })

    it('should throw an error when assigned an invalid state', function() {
      should(() => { device.rollerState = 'foo' }).throw()
    })
  })

  describe('#_settingsValidator()', function() {
    it('should return the given settings', function() {
      const settings = {}
      device._settingsValidator(settings).should.equal(settings)
    })

    it('should update the mode', function() {
      const changeModeHandler = sinon.fake()
      device.on('change:mode', changeModeHandler)

      device.mode.should.equal('relay')

      device.settings = { mode: 'roller' }
      changeModeHandler.calledOnce.should.be.true()
      changeModeHandler.calledWith('roller').should.be.true()

      device.settings = { mode: 'relay' }
      changeModeHandler.calledTwice.should.be.true()
      changeModeHandler.calledWith('relay').should.be.true()
    })
  })

  describe('#_updateRollerState()', function() {
    it('should properly update the roller state', function() {
      device.relay0.should.be.false()
      device.relay1.should.be.false()
      device.rollerState.should.equal('stop')

      device._updateRollerState('roller')
      device.rollerState.should.equal('stop')

      device.relay0 = true
      device._updateRollerState('roller')
      device.rollerState.should.equal('open')

      device.relay0 = false
      device.relay1 = true
      device._updateRollerState('roller')
      device.rollerState.should.equal('close')

      device.relay1 = false
      device._updateRollerState('roller')
      device.rollerState.should.equal('stop')

      device.settings = { mode: 'roller', rollers: [ { swap: true } ] }

      device.relay0 = true
      device._updateRollerState('roller')
      device.rollerState.should.equal('close')

      device.relay0 = false
      device.relay1 = true
      device._updateRollerState('roller')
      device.rollerState.should.equal('open')

      device.relay1 = false
      device._updateRollerState('roller')
      device.rollerState.should.equal('stop')
    })

    it('should do nothing when mode is not \'roller\'', function() {
      device.relay0 = true
      device._updateRollerState('relay')
      device.rollerState.should.equal('stop')
    })
  })

  describe('#_applyUpdate()', function() {
    it('should invoke _updateRollerState()', function() {
      const _updateRollerState = sinon.stub(device, '_updateRollerState')
      device._applyUpdate({}, [])
      _updateRollerState.calledOnce.should.be.true()
      _updateRollerState.calledWith(device.mode).should.be.true()
    })
  })

  describe('#setRollerState()', function() {
    let get = null

    beforeEach(function() {
      get = sinon.stub(request, 'get')
    })

    it('should request a URL with a proper query string', function() {
      get.resolves({})

      device.setRollerState('open')
      get.calledOnce.should.be.true()
      get.calledWith(`${device.host}/roller/0?go=open`).should.be.true()

      device.setRollerState('close', 20)
      get.calledTwice.should.be.true()
      get.calledWith(`${device.host}/roller/0?go=close&duration=20`)
        .should.be.true()
    })

    it('should resolve with the request body', function() {
      const body = {}
      get.resolves({ body })

      return device.setRollerState('open').should.be.fulfilledWith(body)
    })

    it('should reject failed requests', function() {
      get.rejects()
      device.setRollerState('open').should.be.rejected()
    })
  })

  describe('#setRollerPosition()', function() {
    let get = null

    beforeEach(function() {
      get = sinon.stub(request, 'get')
    })

    it('should request a URL with a proper query string', function() {
      get.resolves({})

      device.setRollerPosition(55)
      get.calledOnce.should.be.true()
      get.calledWith(`${device.host}/roller/0?go=to_pos&roller_pos=55`)
        .should.be.true()
    })

    it('should resolve with the request body', function() {
      const body = {}
      get.resolves({ body })

      return device.setRollerPosition(20).should.be.fulfilledWith(body)
    })

    it('should reject failed requests', function() {
      get.rejects()
      device.setRollerPosition(20).should.be.rejected()
    })
  })
})
