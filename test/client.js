/* global describe, it, before */

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

  before(function () {
    client = new Hs100Api.Client();
    plug = client.getPlug(config);
    invalidPlug = client.getPlug({host: '1.2.3.4', timeout: 1000});
  });

  describe('#getPlug', function () {
    it('should find a plug by IP address', function () {
      return plug.getInfo().should.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return invalidPlug.getInfo().should.eventually.be.rejected;
    });
  });

  describe('#search', function () {
    it('should search and find plugs', function () {
      this.timeout(3500);
      this.slow(3500);
      client.search().should.eventually.include.something.with.property('err_code', 0)
        .and.include.something.with.property('host', config.host)
        .and.include.something.with.property('port', config.port);
    });

    it('should search and find plugs to turn on', function () {
      this.skip();
      this.timeout(5000);
      return client.search().then((plugInfoArray) => {
        plugInfoArray.forEach((plugInfo) => {
          client.getPlug(plugInfo).setPowerState(true);
        });
      }).should.eventually.be.fulfilled;
    });
  });
});
