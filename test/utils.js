/* global describe, it */

'use strict';

const chai = require('chai');
chai.should();

const encryptWithHeader = require('../utils').encryptWithHeader;
const decrypt = require('../utils').decrypt;

var payloads = {
  setPowerStateOn: ['{"system":{"set_relay_state":{"state":1}}}', 'AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu36Lfog=='],
  setPowerStateOff: ['{"system":{"set_relay_state":{"state":0}}}', 'AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu3qPeow=='],
  getSysInfo: ['{ "system":{ "get_sysinfo":null } }', 'AAAAI9Dw0qHYq9+61/XPtJS20bTAn+yV5o/hh+jK8J7rh+vLtpbr'],
  getConsumption: ['{ "emeter":{ "get_realtime":null } }', 'AAAAJNDw0rfav8uu3P7Ev5+92r/LlOaD4o76k/6buYPtmPSYuMXlmA==']
};

function decodeAndDecrypt (input) {
  // node v6: return decrypt(Buffer.from(input, 'base64')).toString('ascii')
  return decrypt(new Buffer(input, 'base64').slice(4)).toString('ascii');
}

function encryptAndEncode (input) {
  return encryptWithHeader(input).toString('base64');
}

describe('utils', function () {
  describe('#decrypt', function () {
    it('should decrypt setState ON payload', function () {
      decodeAndDecrypt(payloads.setPowerStateOn[1]).should.eql(payloads.setPowerStateOn[0]);
    });
    it('should decrypt setState OFF payload', function () {
      decodeAndDecrypt(payloads.setPowerStateOff[1]).should.eql(payloads.setPowerStateOff[0]);
    });
    it('should decode and decrypt getState payload', function () {
      decodeAndDecrypt(payloads.getSysInfo[1]).should.eql(payloads.getSysInfo[0]);
    });
    it('should decode and decrypt usage payload', function () {
      decodeAndDecrypt(payloads.getConsumption[1]).should.eql(payloads.getConsumption[0]);
    });
  });

  describe('#encryptWithHeader', function () {
    it('should encrypt setState ON payload', function () {
      encryptAndEncode(payloads.setPowerStateOn[0]).should.eql(payloads.setPowerStateOn[1]);
    });
    it('should encrypt setState OFF payload', function () {
      encryptAndEncode(payloads.setPowerStateOff[0]).should.eql(payloads.setPowerStateOff[1]);
    });
    it('should encrypt getState payload', function () {
      encryptAndEncode(payloads.getSysInfo[0]).should.eql(payloads.getSysInfo[1]);
    });
    it('should encrypt usage payload', function () {
      encryptAndEncode(payloads.getConsumption[0]).should.eql(payloads.getConsumption[1]);
    });
  });
});
