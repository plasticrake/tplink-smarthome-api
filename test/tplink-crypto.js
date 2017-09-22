/* eslint-env mocha */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const tplinkCrypto = require('../src/tplink-crypto');
const encrypt = tplinkCrypto.encrypt;
const encryptWithHeader = tplinkCrypto.encryptWithHeader;
const decrypt = tplinkCrypto.decrypt;
const decryptWithHeader = tplinkCrypto.decryptWithHeader;

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

describe('tplink-crypto', () => {
  Object.keys(payloads).forEach((plKey) => {
    describe('#decrypt', () => {
      it(`should decrypt ${plKey} payload`, () => {
        let buf = Buffer.from(payloads[plKey].encrypted, 'base64');
        expect(decrypt(buf).toString('ascii')).to.eql(payloads[plKey].plain);
      });
    });

    describe('#decryptWithHeader', () => {
      it(`should decrypt ${plKey} payload`, () => {
        let buf = Buffer.from(payloads[plKey].encryptedWithHeader, 'base64');
        expect(decryptWithHeader(buf).toString('ascii')).to.eql(payloads[plKey].plain);
      });
    });

    describe('#encrypt', () => {
      it(`should encrypt ${plKey} payload`, () => {
        let buf = encrypt(payloads[plKey].plain);
        expect(buf.toString('base64')).to.eql(payloads[plKey].encrypted);
      });
    });

    describe('#encryptWithHeader', () => {
      it(`should encrypt ${plKey} payload`, () => {
        let buf = encryptWithHeader(payloads[plKey].plain);
        expect(buf.toString('base64')).to.eql(payloads[plKey].encryptedWithHeader);
      });
    });
  });
});
