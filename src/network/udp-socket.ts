import dgram from 'dgram';
import { decrypt, encrypt } from 'tplink-smarthome-crypto';

import { replaceControlCharacters } from '../utils';
import TplinkSocket from './tplink-socket';

/**
 * @hidden
 */
export default class UdpSocket extends TplinkSocket {
  readonly socketType = 'UDP';

  override socket?: dgram.Socket;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logDebug(...args: any[]): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log.debug(`[${this.socketId}] UdpSocket${args.shift()}`, ...args);
  }

  async createSocketImpl(): Promise<dgram.Socket> {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      this.socket = socket;

      this.socket.on('error', (err) => {
        this.logDebug(': createSocket:error');
        reject(err);
      });

      this.socket.bind(() => {
        this.logDebug('.createSocket(): listening on %j', socket.address());
        socket.removeAllListeners('error'); // remove listener so promise can't be resolved & rejected

        this.isBound = true;
        resolve(socket);
      });
    });
  }

  override close(): void {
    if (this.socket !== undefined) this.socket.close();
    super.close();
  }

  protected async sendAndGetResponse(
    payload: string,
    port: number,
    host: string,
    timeout: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const { socket } = this;
      if (socket === undefined)
        throw new Error('send called without creating socket');

      let timer: NodeJS.Timeout | undefined;
      const setSocketTimeout = (socketTimeout: number): void => {
        if (timer != null) clearTimeout(timer);
        if (socketTimeout > 0) {
          timer = setTimeout(() => {
            this.logDebug(`: socketTimeout(${socketTimeout})`);
            reject(
              new Error(
                `UDP Timeout after ${socketTimeout}ms\n${host}:${port} ${payload}`,
              ),
            );
          }, socketTimeout);
        }
      };
      setSocketTimeout(timeout);

      socket.removeAllListeners('message');
      socket.removeAllListeners('close');
      socket.removeAllListeners('error');

      socket.on('message', (msg, rinfo) => {
        let decryptedMsg = '';
        try {
          this.logDebug(': socket:data rinfo: %j', rinfo);
          setSocketTimeout(0);

          decryptedMsg = decrypt(msg).toString('utf8');
          this.logDebug(
            `: socket:data message:${replaceControlCharacters(decryptedMsg)}`,
          );

          resolve(decryptedMsg);
        } catch (err) {
          this.log.error(
            `Error processing UDP message: From:[%j] SO_RCVBUF:[%d]${'\n'}  msg:[%o]${'\n'}  decrypted:[${replaceControlCharacters(
              decryptedMsg,
            )}]`,
            rinfo,
            socket.getRecvBufferSize(),
            msg,
          );
          reject(err);
        }
      });

      socket.on('close', () => {
        try {
          this.logDebug(': socket:close');
          setSocketTimeout(0);
        } finally {
          reject(new Error('UDP Socket Closed'));
        }
      });

      socket.on('error', (err) => {
        this.logDebug(': socket:error');
        setSocketTimeout(0);
        reject(err);
      });

      const encryptedPayload = encrypt(payload);
      this.logDebug(': socket:send payload.length', encryptedPayload.length);

      socket.send(
        encryptedPayload,
        0,
        encryptedPayload.length,
        port,
        host,
        (err) => {
          if (err) {
            try {
              this.logDebug(
                `: socket:send socket:error length: ${
                  encryptedPayload.length
                } SO_SNDBUF:${socket.getSendBufferSize()} `,
                err,
              );
              if (this.isBound) this.close();
            } finally {
              reject(err);
            }
            return;
          }
          this.logDebug(': socket:send sent');
        },
      );
    });
  }
}
