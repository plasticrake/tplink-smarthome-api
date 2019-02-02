'use strict';

const dgram = require('dgram');

const { encrypt, decrypt } = require('tplink-smarthome-crypto');

const TplinkSocket = require('./tplink-socket');
const { replaceControlCharacters } = require('../utils');

class UdpSocket extends TplinkSocket {
  get socketType () {
    return 'UDP';
  }

  logDebug () {
    this.log.debug(`[${this.socketId}] UdpSocket`, ...arguments);
  }

  async createSocket () {
    return super.createSocket(() => {
      return new Promise((resolve, reject) => {
        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
          this.logDebug(`: createSocket:error`);
          reject(err);
        });

        this.socket.bind(() => {
          this.logDebug(`.createSocket(): listening on %j`, this.socket.address());
          this.socket.removeAllListeners('error');
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
            this.logDebug(`: timeout(${timeout})`);
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
          this.logDebug(`: socket:data rinfo: %j`, rinfo);
          setSocketTimeout(0);

          decryptedMsg = decrypt(msg).toString('utf8');
          this.logDebug(`: socket:data message:${replaceControlCharacters(decryptedMsg)}`);
          return resolve(JSON.parse(decryptedMsg));
        } catch (err) {
          this.log.error(`Error processing UDP message: From:[%j] SO_RCVBUF:[%d]${'\n'}  msg:[%o]${'\n'}  decrypted:[${replaceControlCharacters(decryptedMsg)}]`, rinfo, socket.getRecvBufferSize(), msg);
          reject(err);
        }
      });

      socket.on('close', () => {
        try {
          this.logDebug(`: socket:close`);
          setSocketTimeout(0);
        } finally {
          reject(new Error('UDP Socket Closed'));
        }
      });

      socket.on('error', (err) => {
        this.logDebug(`: socket:error`);
        reject(err);
      });

      const encyptedPayload = encrypt(payload);
      this.logDebug(`: socket:send payload.length`, encyptedPayload.length);

      socket.send(encyptedPayload, 0, encyptedPayload.length, port, host, (err) => {
        if (err) {
          try {
            this.logDebug(`: socket:send socket:error length: ${encyptedPayload.length} SO_SNDBUF:${socket.getSendBufferSize()} `, err);
            if (this.isBound) this.close();
          } finally {
            reject(err);
          }
          return;
        }
        this.logDebug(`: socket:send sent`);
      });
    });
  }
}

module.exports = UdpSocket;
