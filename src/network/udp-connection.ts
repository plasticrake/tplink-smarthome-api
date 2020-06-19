const TplinkConnection = require('./tplink-connection');
const UdpSocket = require('./udp-socket');

class UdpConnection extends TplinkConnection {
  /**
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  get socketType() {
    return 'UDP';
  }

  /**
   * @private
   */
  async getSocket(useSharedSocket) {
    return super.getSocket(UdpSocket, useSharedSocket);
  }

  async send(payload, { timeout, useSharedSocket, sharedSocketTimeout } = {}) {
    return super.send(payload, {
      timeout,
      useSharedSocket,
      sharedSocketTimeout,
    });
  }
}

module.exports = UdpConnection;
