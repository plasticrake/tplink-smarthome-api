import { EventEmitter } from 'events';
import Queue from 'promise-queue';

import type Client from '../client';

import TcpSocket from './tcp-socket';
import UdpSocket from './udp-socket';
import { Logger } from '../logger';

export default abstract class TplinkConnection extends EventEmitter {
  abstract readonly socketType: string;

  // TODO: Move queue to device, so UDP and TCP connections share a queue
  private queue = new Queue(1, Infinity);

  constructor(
    public host: string,
    public port: number,
    readonly log: Logger,
    readonly client: Client
  ) {
    super();

    this.on('timeout', () => {
      this.log.debug(
        `TplinkConnection(${this.description}): timeout()`,
        this.host,
        this.port
      );
      this.queue.add(async () => {
        this.close();
      });
    });
  }

  protected get description(): string {
    return `${this.socketType} ${this.host}:${this.port}`;
  }

  protected abstract async getSocket(
    useSharedSocket?: boolean
  ): Promise<UdpSocket | TcpSocket>;

  async send(
    payload: string,
    port: number,
    host: string,
    {
      timeout,
      useSharedSocket,
      sharedSocketTimeout,
    }: {
      timeout: number;
      useSharedSocket?: boolean;
      sharedSocketTimeout?: number;
    }
  ): Promise<string> {
    this.log.debug(`TplinkConnection(${this.description}).send(%j)`, {
      payload,
      timeout,
      useSharedSocket,
      sharedSocketTimeout,
    });

    // Allow redefining post/host on each send in case device IP has changed
    this.port = port;
    this.host = host;

    let socket: TcpSocket | UdpSocket;
    return this.queue.add(async () => {
      try {
        socket = await this.getSocket(useSharedSocket);
        const response = await socket.send(payload, this.port, this.host, {
          timeout,
        });
        if (!useSharedSocket) {
          socket.close();
        }
        return response;
      } catch (err) {
        this.log.error(`${this.description} %s`, err);
        if (socket && socket.isBound) socket.close();
        throw err;
      }
    });
  }

  close(): void {
    this.log.debug(`TplinkConnection(${this.description}).close()`);
  }
}
