import TplinkConnection from './tplink-connection';
import TcpSocket from './tcp-socket';

export default class TcpConnection extends TplinkConnection {
  readonly socketType = 'TCP';

  protected async getSocket(): Promise<TcpSocket> {
    this.log.debug(`TcpConnection(${this.description}).getSocket()`);

    const socket = new TcpSocket(this.client.getNextSocketId(), this.log);
    await socket.createSocket();
    return socket;
  }

  async send(
    payload: string,
    port: number,
    host: string,
    { timeout }: { timeout: number }
  ): Promise<string> {
    return super.send(payload, port, host, { timeout });
  }
}
