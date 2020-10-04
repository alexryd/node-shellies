/* eslint-env mocha */
const should = require('should')
const sinon = require('sinon')

const { Device } = require('../lib/devices/base')
const devices = require('../lib/devices')
const Http = require('../lib/http')
const UnknownDevice = require('../lib/devices/unknown')

describe('devices', function() {
  describe('.create()', function() {
    it('should return instances of Device for known device types', function() {
      devices.create(
        'SHSW-1',
        'ABC123',
        '192.168.1.2'
      ).should.be.instanceof(Device)
    })

    it('should return an UnknownDevice for unknown device types', function() {
      devices.create(
        'UNKNOWN-1',
        'ABC123',
        '192.168.1.2'
      ).should.be.instanceof(UnknownDevice)
    })
  })

  describe('.isUnknown()', function() {
    it('should return true for unknown devices', function() {
      devices.isUnknown(
        devices.create(
          'UNKNOWN-1',
          'ABC123',
          '192.168.1.2'
        )
      ).should.be.true()
    })

    it('should return false for known devices', function() {
      devices.isUnknown(
        devices.create(
          'SHSW-1',
          'ABC123',
          '192.168.1.2'
        )
      ).should.be.false()
    })
  })
})

describe('Device', function() {
  let device = null

  beforeEach(function() {
    device = new Device('ABC123', '192.168.1.2')
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
    it('should return the name when one is set', function() {
      device.settings = { name: 'foo' }
      device.name = 'bar'
      device.name.should.equal('bar')
    })

    it('should return the name from the settings', function() {
      device.settings = { name: 'foo' }
      device.name.should.equal('foo')
    })

    it('should return undefined when no settings have been loaded', function() {
      should(device.name).be.undefined()
    })
  })

  describe('#httpRequest', function() {
    it('should not return null when _httpRequest is not set', function() {
      should(device._httpRequest).be.null()
      device.httpRequest.should.be.ok()
    })

    it('should return _httpRequest when it is set', function() {
      const r = {}
      device._httpRequest = r
      device.httpRequest.should.equal(r)
    })
  })

  describe('#_defineProperty()', function() {
    it('should define a property', function() {
      device._defineProperty('foo')
      Object.prototype.hasOwnProperty.call(device, 'foo').should.equal(true)
      should(device.foo).be.null()
      device.foo = 'bar'
      device.foo.should.equal('bar')
    })

    it('should associate the property with the given mode', function() {
      device._defineProperty('foo', 'bar')
      device._props.get('foo').should.equal('bar')
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

  describe('#_mapCoapProperties()', function() {
    it('should associate a property with a given ID', function() {
      device._defineProperty('foo')
      device._mapCoapProperties({ foo: 1 })
      device._coapProps.get('').get(1).should.equal('foo')
    })

    it('should associate properties with the given IDs', function() {
      device._defineProperty('foo')
      device._mapCoapProperties({ foo: [1, 212, 33] })
      device._coapProps.get('').get(1).should.equal('foo')
      device._coapProps.get('').get(212).should.equal('foo')
      device._coapProps.get('').get(33).should.equal('foo')
    })
  })

  describe('#[Symbol.iterator]()', function() {
    it('should return an iterator', function() {
      device.should.be.iterable()
      device[Symbol.iterator]().should.be.iterator()
    })

    it('should iterate through defined properties', function() {
      device._defineProperty('foo')
      device._defineProperty('bar')
      device._defineProperty('baz')

      const seenProps = new Set()

      for (const [key, value] of device) { // eslint-disable-line no-unused-vars
        seenProps.add(key)
      }

      seenProps.has('foo').should.be.true()
      seenProps.has('bar').should.be.true()
      seenProps.has('baz').should.be.true()
    })

    it('should only include properties for the current mode', function() {
      device._defineProperty('foo')
      device._defineProperty('bar', 'mode1')
      device._defineProperty('baz', 'mode2')
      device.mode = 'mode2'

      const seenProps = new Set()

      for (const [key, value] of device) { // eslint-disable-line no-unused-vars
        seenProps.add(key)
      }

      seenProps.has('foo').should.be.true()
      seenProps.has('bar').should.be.false()
      seenProps.has('baz').should.be.true()
    })
  })

  describe('#applyCoapUpdate()', function() {
    it('should update the host', function() {
      const changeHostHandler = sinon.fake()
      const msg = {
        host: '192.168.1.3',
      }

      device.on('change:host', changeHostHandler)
      device.applyCoapUpdate(msg, [])

      changeHostHandler.calledOnce.should.equal(true)
      changeHostHandler.calledWith(msg.host).should.equal(true)
    })

    it('should set `online` to true', function() {
      device.online = false
      device.applyCoapUpdate({})
      device.online.should.equal(true)
    })

    it('should not set `ttl` when `validFor` is not specified', function() {
      device.ttl = 0
      device.applyCoapUpdate({})
      device.ttl.should.equal(0)
    })

    it('should set `ttl` when `validFor` is specified', function() {
      const msg = {
        validFor: 37,
      }

      device.ttl = 0
      device.applyCoapUpdate(msg)
      device.ttl.should.equal(msg.validFor * 1000)
    })

    it('should set `lastSeen`', function() {
      should(device.lastSeen).be.null()
      device.applyCoapUpdate({})
      device.lastSeen.should.not.be.null()
    })
  })

  describe('#_applyCoapUpdate()', function() {
    it('should update the properties from to the payload', function() {
      const changeFooHandler = sinon.fake()
      const payload = [
        [0, 1, 2],
      ]

      device._defineProperty('foo')
      device._mapCoapProperties({ foo: 1 })
      device.on('change:foo', changeFooHandler)
      device._applyCoapUpdate({}, payload)

      changeFooHandler.calledOnce.should.equal(true)
      changeFooHandler.calledWith(payload[0][2]).should.equal(true)
    })
  })

  describe('#setHttpAuthCredentials()', function() {
    it('should create a request object if none exists', function() {
      should(device._httpRequest).be.null()
      device.setHttpAuthCredentials('foo', 'bar')
      device._httpRequest.should.be.ok()
    })
  })
})

describe('Shelly2', function() {
  let device = null

  beforeEach(function() {
    device = devices.create('SHSW-21', 'ABC123', '192.168.1.2')
  })

  afterEach(function() {
    sinon.restore()
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

      device.settings = { mode: 'roller', rollers: [{ swap: true }] }

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

  describe('#_applyCoapUpdate()', function() {
    it('should set mode to "roller" when property 113 is present', function() {
      device.mode.should.equal('relay')
      device._applyCoapUpdate(
        { protocolRevision: '1' },
        [[0, 112, 0], [0, 113, 0], [0, 122, 1]]
      )
      device.mode.should.equal('roller')
    })

    it('should set mode to "relay" when property 113 is absent', function() {
      device.mode = 'roller'
      device._applyCoapUpdate(
        { protocolRevision: '1' },
        [[0, 112, 0], [0, 122, 1]]
      )
      device.mode.should.equal('relay')
    })

    it('should invoke _updateRollerState()', function() {
      const _updateRollerState = sinon.stub(device, '_updateRollerState')
      device._applyCoapUpdate({ protocolRevision: '1' }, [])
      _updateRollerState.called.should.be.true()
      _updateRollerState.calledWith(device.mode).should.be.true()
    })
  })

  describe('#setRollerState()', function() {
    let get = null

    beforeEach(function() {
      get = sinon.stub(Http.request, 'get')
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
      get = sinon.stub(Http.request, 'get')
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

describe('ShellyRGBW2', function() {
  let device = null

  beforeEach(function() {
    device = devices.create('SHRGBW2', 'ABC123', '192.168.1.2')
  })

  afterEach(function() {
    sinon.restore()
  })

  describe('#_applyCoapUpdate()', function() {
    it(
      'should set mode to "white" when properties 171 and 181 are present',
      function() {
        device.mode.should.equal('color')
        device._applyCoapUpdate(
          { protocolRevision: '1' },
          [[0, 112, 0], [0, 171, 0], [0, 181, 1]]
        )
        device.mode.should.equal('white')
      }
    )

    it(
      'should set mode to "color" when properties 171 and 181 are absent',
      function() {
        device.mode = 'white'
        device._applyCoapUpdate(
          { protocolRevision: '1' },
          [[0, 112, 0], [0, 122, 1]]
        )
        device.mode.should.equal('color')

        device.mode = 'white'
        device._applyCoapUpdate(
          { protocolRevision: '1' },
          [[0, 112, 0], [0, 171, 0], [0, 122, 1]]
        )
        device.mode.should.equal('color')

        device.mode = 'white'
        device._applyCoapUpdate(
          { protocolRevision: '1' },
          [[0, 112, 0], [0, 181, 0], [0, 122, 1]]
        )
        device.mode.should.equal('color')
      }
    )
  })
})
