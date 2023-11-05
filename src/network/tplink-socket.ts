import Queue from 'promise-queue';
import dgram from 'dgram';
import net from 'net';
import type { Logger } from '../logger';

/**
 * @hidden
 */
export default abstract class TplinkSocket {
  abstract socketType: string;

  socket?: dgram.Socket | net.Socket;

  isBound = false;

  queue = new Queue(1, Infinity);

  constructor(
    readonly socketId: number,
    readonly log: Logger,
  ) {}

  protected abstract createSocketImpl(): Promise<dgram.Socket | net.Socket>;

  async createSocket(): Promise<dgram.Socket | net.Socket> {
    this.log.debug(
      `[${this.socketId}] TplinkSocket(${this.socketType}).createSocket()`,
    );

    if (this.socket) {
      throw new Error('Socket Already Created');
    }

    try {
      this.socket = await this.createSocketImpl();
      return this.socket;
    } catch (err) {
      this.log.error(`${this.socketType} Error (createSocket): %s`, err);
      this.isBound = false;
      throw err;
    }
  }

  protected abstract sendAndGetResponse(
    payload: string,
    port: number,
    host: string,
    timeout: number,
  ): Promise<string>;

  async send(
    payload: string,
    port: number,
    host: string,
    { timeout }: { timeout: number },
  ): Promise<string> {
    this.log.debug(
      `[${this.socketId}] TplinkSocket(${this.socketType}).send(%j)`,
      { payload, port, host, timeout },
    );

    return this.queue
      .add(async () => {
        try {
          return await this.sendAndGetResponse(payload, port, host, timeout);
        } catch (err) {
          this.log.debug(
            `[${this.socketId}] TplinkSocket(${this.socketType}).send()`,
            err,
          );
          if (this.isBound) this.close();
          throw err;
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  close(): void {
    this.log.debug(
      `[${this.socketId}] TplinkSocket(${this.socketType}).close()`,
    );
    this.isBound = false;
  }

  unref(): dgram.Socket | net.Socket {
    if (this.socket === undefined)
      throw new Error('unref called without creating socket');
    return this.socket.unref();
  }
}
