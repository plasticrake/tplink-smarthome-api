'use strict';

require('dotenv').config();

const client = { debug: false };
// Configuration used by some tests. Will turn the device off/on.
const device = { host: process.env.TEST_DEVICE_HOST, port: 9999 };
const plug = { host: process.env.TEST_PLUG_HOST, port: 9999 };

const invalidDevice = { deviceId: 'invalidDevice', host: '192.0.2.0', timeout: 1000 };

module.exports = {client, device, plug, invalidDevice};
