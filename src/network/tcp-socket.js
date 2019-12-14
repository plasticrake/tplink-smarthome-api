'use strict';

const net = require('net');

const { encryptWithHeader, decrypt } = require('tplink-smarthome-crypto');

const TplinkSocket = require('./tplink-socket');
const { replaceControlCharacters } = require('../utils');

class TcpSocket extends TplinkSocket {
  get socketType () {
    return 'TCP';
  }

  logDebug (...args) {
    this.log.debug(`[${this.socketId}] TcpSocket` + args.shift(), ...args);
  }

  async createSocket () {
    return super.createSocket(() => {
      return new Promise((resolve, reject) => {
        this.socket = new net.Socket();
        resolve(this.socket);
      });
    });
  }

  close () {
    super.close(() => {
      this.socket.end();
    });
  }

  /**
   * @private
   */
  async sendAndGetResponse (payload, port, host, timeout) {
    return new Promise((resolve, reject) => {
      let deviceDataBuf;
      let segmentCount = 0;
      let decryptedMsg;

      let timer;
      const setSocketTimeout = (timeout) => {
        if (timer != null) clearTimeout(timer);
        if (timeout > 0) {
          timer = setTimeout(() => {
            this.logDebug(`: timeout(${timeout})`);
            try {
              this.destroy();
            } finally {
              reject(new Error('TCP Timeout'));
            }
          }, timeout);
        }
      };
      setSocketTimeout(timeout);

      const socket = this.socket;
      socket.removeAllListeners('data');
      socket.removeAllListeners('error');

      socket.on('data', (data) => {
        try {
          segmentCount += 1;

          if (deviceDataBuf === undefined) {
            deviceDataBuf = data;
          } else {
            deviceDataBuf = Buffer.concat([deviceDataBuf, data], deviceDataBuf.length + data.length);
          }

          if (deviceDataBuf.length < 4) {
            this.logDebug(`: socket:data: segment:${segmentCount} bufferLength:${deviceDataBuf.length} ...`);
            return;
          }
          const expectedResponseLen = deviceDataBuf.slice(0, 4).readInt32BE();
          const actualResponseLen = deviceDataBuf.length - 4;

          if (actualResponseLen >= expectedResponseLen) {
            setSocketTimeout(0);
            decryptedMsg = decrypt(deviceDataBuf.slice(4)).toString('utf8');
            this.logDebug(`: socket:data: segment:${segmentCount} ${actualResponseLen}/${expectedResponseLen} [${replaceControlCharacters(decryptedMsg)}]`);
            this.socket.end();
          } else {
            this.logDebug(`: socket:data: segment:${segmentCount} ${actualResponseLen}/${expectedResponseLen} ...`);
          }
        } catch (err) {
          this.logDebug(': socket:data error');
          console.dir(data);
          reject(err);
        }
      });

      socket.once('close', (hadError) => {
        try {
          this.logDebug(`: socket:close, hadError:${hadError}`);
          setSocketTimeout(0);
          this.isBound = false;
          if (hadError || segmentCount === 0) {
            throw new Error(`TCP Socket Closed. segment:${segmentCount} hadError:${hadError}`);
          }
          try {
            return resolve(JSON.parse(decryptedMsg));
          } catch (err) {
            this.log.error(`Error parsing JSON: From: [${socket.remoteAddress} ${socket.remotePort}] TCP segment:${segmentCount} data:%O decrypted:[${replaceControlCharacters(decryptedMsg)}]`, deviceDataBuf);
            throw err;
          }
        } catch (err) {
          this.logDebug(': socket:close error');
          reject(err);
        }
      });

      socket.on('error', (err) => {
        try {
          this.logDebug(': socket:error', err);
          setSocketTimeout(0);
          this.destroy();
        } finally {
          reject(err);
        }
      });

      const encyptedPayload = encryptWithHeader(payload);
      this.logDebug(': socket:send payload.length', encyptedPayload.length);

      this.logDebug(`: socket:send attempting to connect. host:${host}, port:${port}`);
      socket.connect({ port, host }, () => {
        try {
          this.logDebug(`: socket:connect ${socket.localAddress} ${socket.localPort} ${socket.remoteAddress} ${socket.remotePort}`);
          this.isBound = true;
          const writeRet = socket.write(encyptedPayload);
          this.logDebug(': socket:connect:write', (writeRet ? 'flushed' : 'queued'));
        } catch (err) {
          this.logDebug(': socket:connect error');
          reject(err);
        }
      });
    });
  }
}

module.exports = TcpSocket;
