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
  },
  specialChars: {
    plain: 'right single quotation mark:’ left double quotation mark:“ right double quotation mark:” kissing cat face with closed eyes:😽',
    encrypted: '2bDXv8vrmPGf+JTx0aDVus6v27Lds5P+n+2GvF7eR2cLbgh8XDhXIkAsSWkYbQJ2F2MKZQsrRidVPgTmZvraqMGmzrqa/pHkhuqPr96rxLDRpcyjze2A4ZP4wiCgPR12H2wfdhh/XzxdKQlvDm0IKF82QioKaQVqGXwYOF0kQTII+Gf/Qg==',
    encryptedWithHeader: 'AAAAhdmw17/L65jxn/iU8dGg1brOr9uy3bOT/p/thrxe3kdnC24IfFw4VyJALElpGG0CdhdjCmULK0YnVT4E5mb62qjBps66mv6R5Ibqj6/eq8Sw0aXMo83tgOGT+MIgoD0ddh9sH3YYf188XSkJbw5tCChfNkIqCmkFahl8GDhdJEEyCPhn/0I='
  }
};

describe('tplink-crypto', () => {
  Object.keys(payloads).forEach((plKey) => {
    describe('#decrypt', () => {
      it(`should decrypt ${plKey} payload (Buffer)`, () => {
        let buf = Buffer.from(payloads[plKey].encrypted, 'base64');
        expect(decrypt(buf).toString('utf8')).to.eql(payloads[plKey].plain);
      });
    });

    describe('#decryptWithHeader', () => {
      it(`should decrypt ${plKey} payload (Buffer)`, () => {
        let buf = Buffer.from(payloads[plKey].encryptedWithHeader, 'base64');
        expect(decryptWithHeader(buf).toString('utf8')).to.eql(payloads[plKey].plain);
      });
    });

    describe('#encrypt', () => {
      it(`should encrypt ${plKey} payload (string)`, () => {
        let buf = encrypt(payloads[plKey].plain);
        expect(buf).to.eql(Buffer.from(payloads[plKey].encrypted, 'base64'));
      });
      it(`should encrypt ${plKey} payload (Buffer)`, () => {
        let buf = encrypt(Buffer.from(payloads[plKey].plain));
        expect(buf).to.eql(Buffer.from(payloads[plKey].encrypted, 'base64'));
      });
    });

    describe('#encryptWithHeader', () => {
      it(`should encrypt ${plKey} payload (string)`, () => {
        let buf = encryptWithHeader(payloads[plKey].plain);
        expect(buf.toString('base64')).to.eql(payloads[plKey].encryptedWithHeader);
      });
      it(`should encrypt ${plKey} payload (Buffer)`, () => {
        let buf = encryptWithHeader(Buffer.from(payloads[plKey].plain));
        expect(buf.toString('base64')).to.eql(payloads[plKey].encryptedWithHeader);
      });
    });

    describe('#encrypt and #decrypt', function () {
      it(`should encrypt ${plKey} payload and decrypt back to original (string)`, () => {
        let orig = payloads[plKey].plain;
        expect(decrypt(encrypt(orig)).toString('utf8')).to.eql(orig);
      });
      it(`should decrypt ${plKey} payload and encrypt back to original (Buffer)`, () => {
        let origBuf = Buffer.from(payloads[plKey].encrypted, 'base64');
        expect(encrypt(decrypt(origBuf))).to.eql(origBuf);
      });
    });
  });
});
