'use strict';

/**
 * @module hs100-api
 */
module.exports = {
  /**
   * TP-Link Client that interacts with devices
   * @type {Client}
   */
  Client: require('./client'),
  /**
   * TP-Link Device Crypto
   * @type {module:tplink-crypto}
   */
  TplinkCrypto: require('./tplink-crypto')
};
