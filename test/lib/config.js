'use strict';

const client = { debug: false };
// Configuration used by some tests. Will turn the device off/on.
const plug = { host: '10.0.0.60', port: 9999 };

const invalidPlug = { deviceId: 'invalidPlug', host: '1.2.3.4', timeout: 1000 };

module.exports = {client, plug, invalidPlug};
