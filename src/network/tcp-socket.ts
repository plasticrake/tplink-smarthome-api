import net from 'net';
import { encryptWithHeader, decrypt } from 'tplink-smarthome-crypto';

import TplinkSocket from './tplink-socket';
import { replaceControlCharacters } from '../utils';

/**
 * @hidden
 */
export default class TcpSocket extends TplinkSocket {
  readonly socketType = 'TCP';

  socket?: net.Socket;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logDebug(...args: any[]): void {
    this.log.debug(`[${this.socketId}] TcpSocket${args.shift()}`, ...args);
  }

  protected async createSocketImpl(): Promise<net.Socket> {
    return new Promise((resolve) => {
      this.socket = new net.Socket();
      resolve(this.socket);
    });
  }

  close(): void {
    if (this.socket !== undefined) this.socket.end();
    super.close();
  }

  private destroy(exception?: Error): void {
    this.logDebug('#destroy(),', exception || '');

    if (this.socket === undefined)
      throw new Error('destroy called on without creating socket');

    this.socket.destroy(exception);
    this.isBound = false;
  }

  protected async sendAndGetResponse(
    payload: string,
    port: number,
    host: string,
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const { socket } = this;
      if (socket === undefined)
        throw new Error('send called without creating socket');

      let deviceDataBuf: Buffer;
      let segmentCount = 0;
      let decryptedMsg: string;

      let timer: NodeJS.Timeout;
      const setSocketTimeout = (socketTimeout: number): void => {
        if (timer != null) clearTimeout(timer);
        if (socketTimeout > 0) {
          timer = setTimeout(() => {
            this.logDebug(`: socketTimeout(${socketTimeout})`);
            try {
              this.destroy();
            } finally {
              reject(
                new Error(
                  `TCP Timeout after ${socketTimeout}ms\n${host}:${port} ${payload}`
                )
              );
            }
          }, socketTimeout);
        }
      };
      setSocketTimeout(timeout);

      socket.removeAllListeners('data');
      socket.on('data', (data) => {
        try {
          segmentCount += 1;

          if (deviceDataBuf === undefined) {
            deviceDataBuf = data;
          } else {
            deviceDataBuf = Buffer.concat(
              [deviceDataBuf, data],
              deviceDataBuf.length + data.length
            );
          }

          if (deviceDataBuf.length < 4) {
            this.logDebug(
              `: socket:data: segment:${segmentCount} bufferLength:${deviceDataBuf.length} ...`
            );
            return;
          }
          const expectedResponseLen = deviceDataBuf.slice(0, 4).readInt32BE();
          const actualResponseLen = deviceDataBuf.length - 4;

          if (actualResponseLen >= expectedResponseLen) {
            decryptedMsg = decrypt(deviceDataBuf.slice(4)).toString('utf8');
            this.logDebug(
              `: socket:data: segment:${segmentCount} ${actualResponseLen}/${expectedResponseLen} [${replaceControlCharacters(
                decryptedMsg
              )}]`
            );
          } else {
            this.logDebug(
              `: socket:data: segment:${segmentCount} ${actualResponseLen}/${expectedResponseLen} ...`
            );
          }
        } catch (err) {
          this.logDebug(': socket:data error');
          this.logDebug(data);
          reject(err);
        }
      });

      socket.removeAllListeners('close');
      socket.once('close', (hadError) => {
        try {
          this.logDebug(`: socket:close, hadError:${hadError}`);
          setSocketTimeout(0);
          this.isBound = false;
          if (hadError || segmentCount === 0) {
            throw new Error(
              `TCP Socket Closed. segment:${segmentCount} hadError:${hadError}`
            );
          }
          try {
            return resolve(decryptedMsg);
          } catch (err) {
            this.log.error(
              `Error parsing JSON: From: [${socket.remoteAddress} ${
                socket.remotePort
              }] TCP segment:${segmentCount} data:%O decrypted:[${replaceControlCharacters(
                decryptedMsg
              )}]`,
              deviceDataBuf
            );
            throw err;
          }
        } catch (err) {
          this.logDebug(': socket:close error');
          return reject(err);
        }
      });

      socket.removeAllListeners('error');
      socket.on('error', (err) => {
        try {
          this.logDebug(': socket:error', err);
          setSocketTimeout(0);
          this.destroy();
        } finally {
          reject(err);
        }
      });

      const encryptedPayload = encryptWithHeader(payload);
      this.logDebug(': socket:send payload.length', encryptedPayload.length);

      this.logDebug(
        `: socket:send attempting to connect. host:${host}, port:${port}`
      );
      socket.connect({ port, host }, () => {
        try {
          this.logDebug(
            `: socket:connect ${socket.localAddress} ${socket.localPort} ${socket.remoteAddress} ${socket.remotePort}`
          );
          this.isBound = true;
          socket.end(encryptedPayload);
          this.logDebug(': socket:connect:end');
        } catch (err) {
          this.logDebug(': socket:connect error');
          reject(err);
        }
      });
    });
  }
}
