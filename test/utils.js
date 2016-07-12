'use strict';

var chai = require('chai');
chai.should();

var encryptWithHeader = require('../utils').encryptWithHeader;
var decrypt = require('../utils').decrypt;

var payloads = {
  on: ['{"system":{"set_relay_state":{"state":1}}}', 'AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu36Lfog=='],
  off: ['{"system":{"set_relay_state":{"state":0}}}', 'AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu3qPeow=='],
  getState: ['{ "system":{ "get_sysinfo":null } }', 'AAAAI9Dw0qHYq9+61/XPtJS20bTAn+yV5o/hh+jK8J7rh+vLtpbr'],
  checkConsumption: ['{ "emeter":{ "get_realtime":null } }', 'AAAAJNDw0rfav8uu3P7Ev5+92r/LlOaD4o76k/6buYPtmPSYuMXlmA==']
};

function decodeAndDecrypt (input) {
  return decrypt(Buffer.from(input, 'base64')).toString('ascii');
}

function encryptAndEncode (input) {
  return encryptWithHeader(input).toString('base64');
}

describe('utils', function () {
  describe('#decrypt', function () {
    it('should decode and decrypt setState ON payload', function () {
      decodeAndDecrypt(payloads.on[1]).should.eql(payloads.on[0]);
    });
    it('should decode and decrypt setState OFF payload', function () {
      decodeAndDecrypt(payloads.off[1]).should.eql(payloads.off[0]);
    });
    it('should decode and decrypt getState payload', function () {
      decodeAndDecrypt(payloads.getState[1]).should.eql(payloads.getState[0]);
    });
    it('should decode and decrypt usage payload', function () {
      decodeAndDecrypt(payloads.checkConsumption[1]).should.eql(payloads.checkConsumption[0]);
    });
  });

  describe('#encryptWithHeader', function () {
    it('should encode and encrypt setState ON payload', function () {
      encryptAndEncode(payloads.on[0]).should.eql(payloads.on[1]);
    });
    it('should encode and encrypt setState OFF payload', function () {
      encryptAndEncode(payloads.off[0]).should.eql(payloads.off[1]);
    });
    it('should encode and encrypt getState payload', function () {
      encryptAndEncode(payloads.getState[0]).should.eql(payloads.getState[1]);
    });
    it('should encode and encrypt usage payload', function () {
      encryptAndEncode(payloads.checkConsumption[0]).should.eql(payloads.checkConsumption[1]);
    });
  });
});
