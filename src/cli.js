#! /usr/bin/env node
'use strict';

const castArray = require('lodash.castarray');
const program = require('commander');
const tplinkCrypto = require('tplink-smarthome-crypto');
const util = require('util');

const { Client, ResponseError } = require('./');

let logLevel;
let client;

const outputError = function (err) {
  if (err instanceof ResponseError) {
    console.log('Response Error:');
    console.log(err.response);
  } else {
    console.error('Error:');
    console.error(err);
  }
};

const search = function (sysInfo, breakoutChildren, timeout, params) {
  try {
    console.log('Searching...');

    const commandParams = Object.assign({}, { discoveryInterval: 2000, discoveryTimeout: timeout, breakoutChildren }, params); // {discoveryInterval: 2000, discoveryTimeout: timeout, ...params};
    console.log(`startDiscovery(${util.inspect(commandParams)})`);
    client.startDiscovery(commandParams)
      .on('device-new', (device) => {
        console.log(`${device.model} ${device.deviceType} ${device.type} ${device.host} ${device.port} ${device.macNormalized} ${device.deviceId} ${device.alias}`);
        if (sysInfo) {
          console.dir(device.sysInfo, { colors: program.color === 'on', depth: 10 });
        }
      });
  } catch (err) {
    outputError(err);
  }
};

const send = async function (host, port, payload) {
  try {
    console.log(`Sending to ${host}:${port || ''} via ${client.defaultSendOptions.transport}...`);
    const data = await client.send(payload, host, port);
    console.log('response:');
    console.dir(data, { colors: program.color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
};

const sendCommand = async function (host, port, childId, payload) {
  try {
    console.log(`Sending to ${host}:${port || ''} ${childId ? 'childId: ' + childId : ''} via ${client.defaultSendOptions.transport}...`);
    const device = await client.getDevice({ host, port, childId });
    const results = await device.sendCommand(payload);
    console.log('response:');
    console.dir(results, { colors: program.color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
};

const sendCommandDynamic = async function (host, port, command, commandParams = [], childId = null) {
  try {
    console.log(`Sending ${command} command to ${host}:${port || ''} ${childId ? 'childId: ' + childId : ''} via ${client.defaultSendOptions.transport}...`);
    const device = await client.getDevice({ host, port, childId });
    const results = await device[command](...commandParams);
    console.log('response:');
    console.dir(results, { colors: program.color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
};

const details = async function (host, port, timeout) {
  try {
    console.log(`Getting details from ${host}:${port || ''}...`);
    const device = await client.getDevice({ host, port });
    console.dir({
      alias: device.alias,
      deviceId: device.deviceId,
      description: device.description,
      model: device.model,
      deviceType: device.deviceType,
      type: device.type,
      softwareVersion: device.softwareVersion,
      hardwareVersion: device.hardwareVersion,
      mac: device.mac
    }, { colors: program.color === 'on', depth: 10 });
  } catch (err) {
    outputError(err);
  }
};

const blink = function (host, port, times, rate, timeout) {
  console.log(`Sending blink commands to ${host}:${port || ''}...`);
  client.getDevice({ host, port }).then((device) => {
    return device.blink(times, rate).then(() => {
      console.log('Blinking complete');
    });
  }).catch((reason) => {
    outputError(reason);
  });
};

const toInt = (s) => {
  return parseInt(s, 10);
};

const setupClient = function () {
  const defaultSendOptions = {};
  if (program.udp) defaultSendOptions.transport = 'udp';
  if (program.timeout) defaultSendOptions.timeout = program.timeout;
  return new Client({ logLevel, defaultSendOptions });
};

const setParamTypes = function setParamTypes (params, types) {
  if (params && params.length > 0 && types && types.length > 0) {
    return castArray(params).map((el, i) => {
      switch (types[i]) {
        case 'number':
          return +el;
        case 'boolean':
          return (el === 'true' || el === '1');
      }
      return el;
    });
  }
  return params;
};

program
  .option('-D, --debug', 'turn on debug level logging', () => { logLevel = 'debug'; })
  .option('-t, --timeout <ms>', 'timeout (ms)', toInt, 10000)
  .option('-u, --udp', 'send via UDP')
  .option('-c, --color [on]', 'output will be styled with ANSI color codes', 'on');

program
  .command('search [params]')
  .description('Search for devices')
  .option('-s, --sysinfo', 'output sysInfo')
  .option('-b, --breakout-children', 'output children (multi-outlet plugs)', true)
  .action(function (params, options) {
    client = setupClient();
    if (params) {
      console.dir(params);
      params = JSON.parse(params);
    }
    search(options.sysinfo, options.breakoutChildren || false, program.timeout, params);
  });

program
  .command('send <host> <payload>')
  .description('Send payload to device (using Client.send)')
  .action(function (host, payload, options) {
    client = setupClient();
    const [hostOnly, port] = host.split(':');
    send(hostOnly, port, payload);
  });

program
  .command('sendCommand <host> <payload>')
  .description('Send payload to device (using Device#sendCommand)')
  .option('-c, --childId [childId]', 'childId')
  .action(function (host, payload, options) {
    client = setupClient();
    const [hostOnly, port] = host.split(':');
    sendCommand(hostOnly, port, options.childId, payload);
  });

program
  .command('details <host>')
  .action(function (host, options) {
    client = setupClient();
    const [hostOnly, port] = host.split(':');
    details(hostOnly, port, program.timeout);
  });

program
  .command('blink <host> [times] [rate]')
  .action(function (host, times = 5, rate = 500, options) {
    client = setupClient();
    const [hostOnly, port] = host.split(':');
    blink(hostOnly, port, times, rate);
  });

[ { fnName: 'getSysInfo', supportsChildId: true },
  { fnName: 'getInfo', supportsChildId: true },
  { fnName: 'setAlias', supportsChildId: true },
  { fnName: 'getModel', supportsChildId: true },
  { fnName: 'setPowerState', paramTypes: ['boolean'], supportsChildId: true },
  { fnName: 'setLocation', paramTypes: ['number', 'number'] },
  { fnName: 'reboot', paramTypes: ['number'] },
  { fnName: 'reset', paramTypes: ['number'] }
].forEach((command) => {
  let commandName;
  let paramTypes;
  let supportsChildId = false;
  if (command.fnName) {
    commandName = command.fnName;
    paramTypes = command.paramTypes;
    supportsChildId = command.supportsChildId;
  } else {
    commandName = command;
  }
  let cmd = program
    .command(`${commandName} <host> [params]`)
    .description(`Send ${commandName} to device (using Device#${commandName})`)
    .option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 10000);
  if (supportsChildId) {
    cmd = cmd.option('-c, --childId [childId]', 'childId');
  }
  cmd.action(function (host, params, options) {
    client = setupClient();
    const [hostOnly, port] = host.split(':');
    sendCommandDynamic(hostOnly, port, commandName, setParamTypes(params, paramTypes), options.childId);
  });
});

program
  .command('encrypt <outputEncoding> <input> [firstKey=0xAB]')
  .action(function (outputEncoding, input, firstKey = 0xAB) {
    const outputBuf = tplinkCrypto.encrypt(input, firstKey);
    console.log(outputBuf.toString(outputEncoding));
  });
program
  .command('encryptWithHeader <outputEncoding> <input> [firstKey=0xAB]')
  .action(function (outputEncoding, input, firstKey = 0xAB) {
    const outputBuf = tplinkCrypto.encryptWithHeader(input, firstKey);
    console.log(outputBuf.toString(outputEncoding));
  });
program
  .command('decrypt <inputEncoding> <input> [firstKey=0xAB]')
  .action(function (inputEncoding, input, firstKey = 0xAB) {
    const inputBuf = Buffer.from(input, inputEncoding);
    const outputBuf = tplinkCrypto.decrypt(inputBuf, firstKey);
    console.log(outputBuf.toString());
  });
program
  .command('decryptWithHeader <inputEncoding> <input> [firstKey=0xAB]')
  .action(function (inputEncoding, input, firstKey = 0xAB) {
    const inputBuf = Buffer.from(input, inputEncoding);
    const outputBuf = tplinkCrypto.decryptWithHeader(inputBuf, firstKey);
    console.log(outputBuf.toString());
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
