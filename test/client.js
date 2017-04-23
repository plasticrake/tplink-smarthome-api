/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Client', function () {
  var client;
  var plug;
  var invalidPlug;

  beforeEach(function () {
    client = new Hs100Api.Client(config.client);
    plug = client.getPlug(config.plug);
    invalidPlug = client.getPlug(config.invalidPlug);
  });

  afterEach(function () {
    client.stopDiscovery();
  });

  describe('#sendDiscovery', function () {
    it('should emit plug-new when finding a new plug', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.sendDiscovery().once('plug-new', (plug) => {
        plug.should.exist;
        done();
      });
    });

    it('should emit plug-online when finding an existing plug', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.sendDiscovery();
      client.sendDiscovery().once('plug-online', (plug) => {
        plug.should.exist;
        done();
      });
    });

    it('should emit plug-offline when calling discovery with an offline plug', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.discoveryInterval = '50';
      client.offlineTolerance = 2;

      invalidPlug.status = 'online';
      client.devices.set(invalidPlug.deviceId, invalidPlug);

      client.startDiscovery().once('plug-offline', (plug) => {
        plug.should.exist;
        done();
      });
    });
  });

  describe('#getPlug', function () {
    it('should find a plug by IP address', function () {
      return plug.getInfo().should.eventually.have.property('sysInfo');
    });

    it('should be rejected with an invalid IP address', function () {
      this.timeout(1500);
      return invalidPlug.getInfo().should.eventually.be.rejected;
    });
  });
});
