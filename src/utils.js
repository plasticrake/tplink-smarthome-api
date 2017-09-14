'use strict';

// #Encryption
// 4 byte big-endian length header
// Followed by the payload where each byte is XOR'd with the previous encrypted byte

module.exports.encrypt = function (input, firstKey = 0xAB) {
  let buf = Buffer.alloc(input.length);
  let key = firstKey;
  for (var i = 0; i < input.length; i++) {
    buf[i] = input.charCodeAt(i) ^ key;
    key = buf[i];
  }
  return buf;
};

module.exports.encryptWithHeader = function (input, firstKey = 0xAB) {
  let bufMsg = module.exports.encrypt(input, firstKey);
  let bufLength = Buffer.alloc(4);
  bufLength.writeUInt32BE(input.length, 0);
  return Buffer.concat([bufLength, bufMsg], input.length + 4);
};

module.exports.decrypt = function (input, firstKey = 0xAB) {
  let buf = Buffer.from(input);
  let key = firstKey;
  let nextKey;
  for (var i = 0; i < buf.length; i++) {
    nextKey = buf[i];
    buf[i] = buf[i] ^ key;
    key = nextKey;
  }
  return buf;
};
