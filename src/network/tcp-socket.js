'use strict';

const net = require('net');

const { encryptWithHeader, decrypt } = require('tplink-smarthome-crypto');

const TplinkSocket = require('./tplink-socket');

class TcpSocket extends TplinkSocket {
  get socketType () {
    return 'TCP';
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
            this.log.debug(`[${this.socketId}] TcpSocket: timeout(${timeout})`);
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

          const expectedResponseLen = deviceDataBuf.slice(0, 4).readInt32BE();
          const actualResponseLen = deviceDataBuf.length - 4;

          if (actualResponseLen >= expectedResponseLen) {
            setSocketTimeout(0);
            decryptedMsg = decrypt(deviceDataBuf.slice(4)).toString('utf8');
            this.log.debug(`[${this.socketId}] TcpSocket: socket:data: ${decryptedMsg}`);
          } else {
            this.log.debug(`[${this.socketId}] TcpSocket: socket:data: segment:${segmentCount} ${actualResponseLen}/${expectedResponseLen}`);
          }
        } catch (err) {
          reject(err);
        }
      });

      socket.once('close', (hadError) => {
        try {
          this.log.debug(`[${this.socketId}] TcpSocket: socket:close, hadError:`, hadError);
          setSocketTimeout(0);
          this.isBound = false;
          if (hadError || segmentCount === 0) {
            throw new Error(`TCP Socket Closed. segmentCount: ${segmentCount} hadError: ${hadError}`);
          }
          if (decryptedMsg !== '') {
            try {
              return resolve(JSON.parse(decryptedMsg));
            } catch (err) {
              this.log.error(`Error parsing JSON: From: [${socket.remoteAddress} ${socket.remotePort}] TCP ${segmentCount} Original: [${deviceDataBuf}] Decrypted: [${decryptedMsg}]`);
              throw err;
            }
          }
          resolve(decryptedMsg);
        } catch (err) {
          reject(err);
        }
      });

      socket.on('error', (err) => {
        try {
          this.log.debug(`[${this.socketId}] TcpSocket: socket:error`, err);
          setSocketTimeout(0);
          this.destroy();
        } finally {
          reject(err);
        }
      });

      const encyptedPayload = encryptWithHeader(payload);
      this.log.debug(`[${this.socketId}] TcpSocket: socket:send payload.length`, encyptedPayload.length);

      this.log.debug(`[${this.socketId}] TcpSocket: socket:send attempting to connect. host:${host}, port:${port}`);
      socket.connect({ port, host }, () => {
        this.log.debug(`[${this.socketId}] TcpSocket: socket:send:connect ${socket.localAddress} ${socket.localPort} ${socket.remoteAddress} ${socket.remotePort}`);
        this.isBound = true;
        const writeRet = socket.write(encyptedPayload);
        this.log.debug(`[${this.socketId}] TcpSocket: socket:send:write`, (writeRet ? 'flushed' : 'queued'));
      });
    });
  }
}

module.exports = TcpSocket;
