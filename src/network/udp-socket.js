'use strict';

const dgram = require('dgram');

const { encrypt, decrypt } = require('tplink-smarthome-crypto');

const TplinkSocket = require('./tplink-socket');

class UdpSocket extends TplinkSocket {
  get socketType () {
    return 'UDP';
  }

  async createSocket () {
    return super.createSocket(() => {
      return new Promise((resolve, reject) => {
        this.socket = dgram.createSocket('udp4');

        this.socket.bind(() => {
          this.log.debug(`[${this.socketId}] UdpSocket.createSocket(): listening on %j`, this.socket.address());
          this.isBound = true;
          resolve(this.socket);
        });
      });
    });
  }

  close () {
    super.close(() => {
      this.socket.close();
    });
  }

  /**
   * @private
   */
  async sendAndGetResponse (payload, port, host, timeout) {
    return new Promise((resolve, reject) => {
      let timer;
      const setSocketTimeout = (timeout) => {
        if (timer != null) clearTimeout(timer);
        if (timeout > 0) {
          timer = setTimeout(() => {
            this.log.debug(`[${this.socketId}] UdpSocket: timeout(${timeout})`);
            reject(new Error('UDP Timeout'));
          }, timeout);
        }
      };
      setSocketTimeout(timeout);

      const socket = this.socket;
      socket.removeAllListeners('message');
      socket.removeAllListeners('close');

      socket.on('message', (msg, rinfo) => {
        let decryptedMsg;
        try {
          this.log.debug(`[${this.socketId}] UdpSocket: socket:data rinfo: %j`, rinfo);
          setSocketTimeout(0);

          decryptedMsg = decrypt(msg).toString('utf8');
          this.log.debug(`[${this.socketId}] UdpSocket: socket:data message: %s`, decryptedMsg);
          if (decryptedMsg !== '') {
            return resolve(JSON.parse(decryptedMsg));
          }
          resolve(decryptedMsg);
        } catch (err) {
          this.log.error('Error processing UDP message: %o\nFrom: [%j] SO_RCVBUF:[%d] msg: [%o] decryptedMsg: [%o]', err, rinfo, socket.getRecvBufferSize(), msg, decryptedMsg);
          reject(err);
        }
      });

      socket.on('close', () => {
        try {
          this.log.debug(`[${this.socketId}] UdpSocket: socket:close`);
          setSocketTimeout(0);
        } finally {
          reject(new Error('UDP Socket Closed'));
        }
      });

      const encyptedPayload = encrypt(payload);
      this.log.debug(`[${this.socketId}] UdpSocket: socket:send payload.length`, encyptedPayload.length);

      socket.send(encyptedPayload, 0, encyptedPayload.length, port, host, (err) => {
        if (err) {
          try {
            this.log.debug(`[${this.socketId}] UdpSocket: socket:send socket:error length: ${encyptedPayload.length} SO_SNDBUF:${socket.getSendBufferSize()} `, err);
            if (this.isBound) this.close();
          } finally {
            reject(err);
          }
        }
      });
    });
  }
}

module.exports = UdpSocket;
