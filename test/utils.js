/* eslint-env mocha */

'use strict';

const chai = require('chai');
chai.should();

const encrypt = require('../src/utils').encrypt;
const encryptWithHeader = require('../src/utils').encryptWithHeader;
const decrypt = require('../src/utils').decrypt;
const decryptWithHeader = require('../src/utils').decryptWithHeader;

var payloads = {
  setPowerStateOn: {
    plain: '{"system":{"set_relay_state":{"state":1}}}',
    encrypted: '0PKB+Iv/mvfV75S2xaDUi/mc8JHot8Sw0aXA4tijgfKG55P21O7fot+i',
    encryptedWithHeader: 'AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu36Lfog=='
  },
  setPowerStateOff: {
    plain: '{"system":{"set_relay_state":{"state":0}}}',
    encrypted: '0PKB+Iv/mvfV75S2xaDUi/mc8JHot8Sw0aXA4tijgfKG55P21O7eo96j',
    encryptedWithHeader: 'AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu3qPeow=='
  },
  getSysInfo: {
    plain: '{ "system":{ "get_sysinfo":null } }',
    encrypted: '0PDSodir37rX9c+0lLbRtMCf7JXmj+GH6MrwnuuH68u2lus=',
    encryptedWithHeader: 'AAAAI9Dw0qHYq9+61/XPtJS20bTAn+yV5o/hh+jK8J7rh+vLtpbr'
  },
  getConsumption: {
    plain: '{ "emeter":{ "get_realtime":null } }',
    encrypted: '0PDSt9q/y67c/sS/n73av8uU5oPijvqT/pu5g+2Y9Ji4xeWY',
    encryptedWithHeader: 'AAAAJNDw0rfav8uu3P7Ev5+92r/LlOaD4o76k/6buYPtmPSYuMXlmA=='
  }
};

describe('utils', () => {
  Object.keys(payloads).forEach((plKey) => {
    describe('#decrypt', () => {
      it(`should decrypt ${plKey} payload`, () => {
        let buf = Buffer.from(payloads[plKey].encrypted, 'base64');
        decrypt(buf).toString('ascii').should.eql(payloads[plKey].plain);
      });
    });

    describe('#decryptWithHeader', () => {
      it(`should decrypt ${plKey} payload`, () => {
        let buf = Buffer.from(payloads[plKey].encryptedWithHeader, 'base64');
        decryptWithHeader(buf).toString('ascii').should.eql(payloads[plKey].plain);
      });
    });

    describe('#encrypt', () => {
      it(`should encrypt ${plKey} payload`, () => {
        let buf = encrypt(payloads[plKey].plain);
        buf.toString('base64').should.eql(payloads[plKey].encrypted);
      });
    });

    describe('#encryptWithHeader', () => {
      it(`should encrypt ${plKey} payload`, () => {
        let buf = encryptWithHeader(payloads[plKey].plain);
        buf.toString('base64').should.eql(payloads[plKey].encryptedWithHeader);
      });
    });
  });
});
