'use strict';

const Queue = require('promise-queue');

class TplinkSocket {
  constructor (socketId, log) {
    this.socketId = socketId;
    this.log = log;

    this.socket = null;
    this.isBound = false;
    this.queue = new Queue(1, Infinity);
  }

  async createSocket (func) {
    this.log.debug(`[${this.socketId}] TplinkSocket(${this.socketType}).createSocket()`);

    if (this.socket) {
      throw new Error('Socket Already Created');
    }

    try {
      this.socket = await func();
      return this.socket;
    } catch (err) {
      this.log.error(`${this.socketType} Error (createSocket): %s`, err);
      this.isBound = false;
      throw err;
    }
  }

  async send (payload, port, host, { timeout } = { }) {
    this.log.debug(`[${this.socketId}] TplinkSocket(${this.socketType}).send(%j)`, { payload, port, host, timeout });

    return this.queue.add(async () => {
      try {
        return this.sendAndGetResponse(payload, port, host, timeout);
      } catch (err) {
        this.log.debug(`[${this.socketId}] TplinkSocket(${this.socketType}).send()`, err);
        if (this.isBound) this.close();
        throw err;
      }
    });
  }

  close (func) {
    this.log.debug(`[${this.socketId}] TplinkSocket(${this.socketType}).close()`);
    func();
    this.isBound = false;
  }

  destroy (exception) {
    this.log.debug(`[${this.socketId}] TplinkSocket(${this.socketType}).destroy()`, exception || '');
    this.socket.destroy(exception);
    this.isBound = false;
  }

  unref () {
    return this.socket.unref();
  }
}

module.exports = TplinkSocket;
