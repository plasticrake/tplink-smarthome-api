'use strict';

/**
 * Netif
 */
class Netif {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Requests `netif.get_scaninfo` (list of WiFi networks).
   *
   * Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
   * The network timeout for the request is calculated by adding the
   * default network timeout to `timeoutInSeconds`.
   * @param  {Boolean}     [refresh=false]       request device's cached results
   * @param  {number}      [timeoutInSeconds=10] timeout for scan in seconds
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getScanInfo (refresh = false, timeoutInSeconds = 10, sendOptions = {}) {
    if (sendOptions.timeout == null) {
      sendOptions.timeout = ((timeoutInSeconds * 1000) * 2) + (this.device.defaultSendOptions.timeout || 5000);
    }
    return this.device.sendCommand({
      [this.apiModuleName]: {
        get_scaninfo: {
          refresh: (refresh ? 1 : 0),
          timeout: timeoutInSeconds
        }
      }
    }, null, sendOptions);
  }
}

module.exports = Netif;
