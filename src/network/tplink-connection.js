'use strict';

const Queue = require('promise-queue');
const EventEmitter = require('events');

class TplinkConnection extends EventEmitter {
  constructor (device) {
    super();
    this.device = device;
    this.client = device.client;
    this.log = device.log;
    this.sharedSocket = null;

    this.queue = new Queue(1, Infinity);

    this.on('timeout', () => {
      this.log.debug(`TplinkConnection(${this.description}): timeout()`, this.host, this.port);
      this.queue.add(async () => {
        this.close();
      });
    });
  }

  /**
   * @private
   */
  get host () {
    return this.device.host;
  }

  /**
   * @private
   */
  get port () {
    return this.device.port;
  }

  /**
   * @private
   */
  get description () {
    return `${this.socketType} ${this.host}:${this.port}`;
  }

  /**
   * @private
   */
  async getSocket (Constructor, useSharedSocket = false) {
    this.log.debug(`TplinkConnection(${this.description}).getSocket(%j)`, { useSharedSocket });

    if (useSharedSocket && this.sharedSocket != null) {
      this.log.debug(`TplinkConnection(${this.description}).getSocket(): reusing shared socket`);
      if (this.sharedSocket.socket != null && this.sharedSocket.isBound) {
        return this.sharedSocket;
      }
      this.log.debug(`TplinkConnection(${this.description}).getSocket(): recreating shared socket`);
    }

    const socket = new Constructor(this.client.getNextSocketId(), this.log);
    await socket.createSocket();

    if (useSharedSocket) {
      socket.unref(); // let node exit cleanly if socket is left open
      this.sharedSocket = socket;
    }

    return socket;
  }

  async send (payload, { timeout, useSharedSocket, sharedSocketTimeout } = { }) {
    this.log.debug(`TplinkConnection(${this.description}).send(%j)`, { payload, timeout, useSharedSocket, sharedSocketTimeout });

    if (useSharedSocket && sharedSocketTimeout != null) {
      this.setTimeout(sharedSocketTimeout);
    }

    let socket;
    return this.queue.add(async () => {
      try {
        socket = await this.getSocket(useSharedSocket);
        const response = await socket.send(payload, this.port, this.host, { timeout });
        if (!useSharedSocket) { socket.close(); }
        return response;
      } catch (err) {
        this.log.error(`${this.description} %s`, err);
        if (socket && socket.isBound) socket.close();
        throw err;
      }
    });
  }

  close () {
    this.log.debug(`TplinkConnection(${this.description}).close()`);
    this.setTimeout(0);
    if (this.sharedSocket && this.sharedSocket.isBound) {
      this.log.debug(`TplinkConnection(${this.description}).close() closing shared socket`);
      this.sharedSocket.close();
    }
  }

  /**
   * @private
   */
  setTimeout (timeout) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (timeout > 0) {
      this.timer = setTimeout(() => {
        this.emit('timeout');
      }, timeout);
    }
  }
}

module.exports = TplinkConnection;
