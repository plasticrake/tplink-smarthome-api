import TplinkConnection from './tplink-connection';
import UdpSocket from './udp-socket';

/**
 * @hidden
 */
export default class UdpConnection extends TplinkConnection {
  protected sharedSocket?: UdpSocket;

  readonly socketType = 'UDP';

  private timeout?: NodeJS.Timeout;

  protected async getSocket(useSharedSocket: boolean): Promise<UdpSocket> {
    this.log.debug(`UdpConnection(${this.description}).getSocket(%j)`, {
      useSharedSocket,
    });

    if (useSharedSocket && this.sharedSocket !== undefined) {
      this.log.debug(
        `UdpConnection(${this.description}).getSocket(): reusing shared socket`
      );
      if (this.sharedSocket.socket != null && this.sharedSocket.isBound) {
        return this.sharedSocket;
      }
      this.log.debug(
        `UdpConnection(${this.description}).getSocket(): recreating shared socket`
      );
    }

    const socket = new UdpSocket(this.client.getNextSocketId(), this.log);
    await socket.createSocket();

    if (useSharedSocket) {
      socket.unref(); // let node exit cleanly if socket is left open
      this.sharedSocket = socket;
    }
    return socket;
  }

  private setTimeout(timeout: number): void {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
    }
    if (timeout > 0) {
      this.timeout = setTimeout(() => {
        this.emit('timeout');
      }, timeout);
    }
  }

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
      useSharedSocket: boolean;
      sharedSocketTimeout: number;
    }
  ): Promise<string> {
    if (useSharedSocket && sharedSocketTimeout != null) {
      this.setTimeout(sharedSocketTimeout);
    }

    const response = await super.send(payload, port, host, {
      timeout,
      useSharedSocket,
      sharedSocketTimeout,
    });

    return response;
  }

  close(): void {
    super.close();
    this.setTimeout(0);

    if (this.sharedSocket && this.sharedSocket.isBound) {
      this.log.debug(
        `TplinkConnection(${this.description}).close() closing shared socket`
      );
      this.sharedSocket.close();
    }
  }
}
