#! /usr/bin/env node
const util = require('util');
const program = require('commander');

const Hs100Api = require('./');
const Client = Hs100Api.Client;
const { ResponseError } = require('./utils');
const tplinkCrypto = require('tplink-smarthome-crypto');

let logLevel;
let client;

let outputError = function (err) {
  if (err instanceof ResponseError) {
    console.log(err.response);
  } else {
    console.error(err);
  }
};

let search = function (sysInfo, timeout, params) {
  try {
    console.log('Searching...');

    let commandParams = Object.assign({}, {discoveryInterval: 2000, discoveryTimeout: timeout}, params); // {discoveryInterval: 2000, discoveryTimeout: timeout, ...params};
    console.log(`startDiscovery(${util.inspect(commandParams)})`);
    client.startDiscovery(commandParams)
      .on('device-new', (device) => {
        console.log(`${device.model} ${device.deviceType} ${device.type} ${device.host} ${device.port} ${device.deviceId} ${device.alias}`);
        if (sysInfo) {
          console.dir(device.sysInfo, {colors: program.color === 'on', depth: 10});
        }
      });
  } catch (err) {
    outputError(err);
  }
};

let send = async function (host, port, payload, timeout) {
  try {
    console.log('Sending...');
    let data = await client.send({host, port, payload, timeout});
    console.log('response:');
    console.dir(data, {colors: program.color === 'on', depth: 10});
  } catch (err) {
    outputError(err);
  }
};

let sendCommand = async function (host, port, payload, timeout) {
  try {
    console.log('Sending command...');
    let device = await client.getDevice({host, port});
    let results = await device.sendCommand(payload, timeout);
    console.log('response:');
    console.dir(results, {colors: program.color === 'on', depth: 10});
  } catch (err) {
    outputError(err);
  }
};

let sendCommandDynamic = async function (host, port, command, commandParams = []) {
  try {
    console.log(`Sending ${command} command...`);
    let device = await client.getDevice({host, port});
    let results = await device[command](...commandParams);
    console.log('response:');
    console.dir(results, {colors: program.color === 'on', depth: 10});
  } catch (err) {
    outputError(err);
  }
};

let details = async function (host, port, timeout) {
  try {
    console.log('Getting details...');
    let device = await client.getDevice({host, port});
    console.dir({
      alias: device.alias,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      model: device.model,
      deviceType: device.deviceType,
      type: device.type,
      softwareVersion: device.softwareVersion,
      hardwareVersion: device.hardwareVersion,
      mac: device.mac
    }, {colors: program.color === 'on', depth: 10});
  } catch (err) {
    outputError(err);
  }
};

let info = async function (host, port, timeout) {
  try {
    console.log('Getting device info...');
    let device = await client.getDevice({host, port});
    let info = await device.getInfo();
    console.dir(info, {colors: program.color === 'on', depth: 10});
  } catch (err) {
    outputError(err);
  }
};

let blink = function (host, port, times, rate, timeout) {
  console.log('Sending blink commands...');
  client.getDevice({host, port}).then((device) => {
    return device.blink(times, rate).then(() => {
      console.log('Blinking complete');
    });
  }).catch((reason) => {
    outputError(reason);
  });
};

let toInt = (s) => {
  return parseInt(s);
};

let setupClient = function () {
  let client = new Client({timeout: program.timeout, logLevel});
  return client;
};

program
  .option('-D, --debug', 'turn on debug level logging', () => { logLevel = 'debug'; })
  .option('-t, --timeout <ms>', 'timeout (ms)', toInt, 5000)
  .option('-c, --color [on]', 'output will be styled with ANSI color codes', 'on');

program
  .command('search [params]')
  .description('Search for devices')
  .option('-s, --sysinfo', 'output sysInfo')
  .action(function (params, options) {
    client = setupClient();
    if (params) {
      console.dir(params);
      params = JSON.parse(params);
    }
    search(options.sysinfo, program.timeout, params);
  });

program
  .command('send <host> <payload>')
  .description('Send payload to device (using Client.send)')
  .action(function (host, payload, options) {
    client = setupClient();
    let [hostOnly, port] = host.split(':');
    send(hostOnly, port, payload, program.timeout);
  });

program
  .command('sendCommand <host> <payload>')
  .description('Send payload to device (using Device#sendCommand)')
  .action(function (host, payload, options) {
    client = setupClient();
    let [hostOnly, port] = host.split(':');
    sendCommand(hostOnly, port, payload, program.timeout);
  });

program
  .command('info <host>')
  .action(function (host, options) {
    client = setupClient();
    let [hostOnly, port] = host.split(':');
    info(hostOnly, port, program.timeout);
  });

program
  .command('details <host>')
  .action(function (host, options) {
    client = setupClient();
    let [hostOnly, port] = host.split(':');
    details(hostOnly, port, program.timeout);
  });

program
  .command('blink <host> [times] [rate]')
  .action(function (host, times = 5, rate = 500, options) {
    client = setupClient();
    let [hostOnly, port] = host.split(':');
    blink(hostOnly, port, times, rate, program.timeout);
  });

[ 'getSysInfo', 'getModel', 'getCloudInfo', 'setAlias', 'getScheduleNextAction', 'getScheduleRules',
  'getTime', 'getTimeZone', 'getScanInfo', 'getEmeterRealtime'
].forEach((command) => {
  program
    .command(`${command} <host> [params]`)
    .description(`Send ${command} to device (using Device#${command})`)
    .option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 5000)
    .action(function (host, params, options) {
      client = setupClient();
      let [hostOnly, port] = host.split(':');
      sendCommandDynamic(hostOnly, port, command, params);
    });
});

program
  .command('encrypt <outputEncoding> <input> [firstKey=0xAB]')
  .action(function (outputEncoding, input, firstKey = 0xAB) {
    let outputBuf = tplinkCrypto.encrypt(input, firstKey);
    console.log(outputBuf.toString(outputEncoding));
  });
program
  .command('encryptWithHeader <outputEncoding> <input> [firstKey=0xAB]')
  .action(function (outputEncoding, input, firstKey = 0xAB) {
    let outputBuf = tplinkCrypto.encryptWithHeader(input, firstKey);
    console.log(outputBuf.toString(outputEncoding));
  });
program
  .command('decrypt <inputEncoding> <input> [firstKey=0xAB]')
  .action(function (inputEncoding, input, firstKey = 0xAB) {
    let inputBuf = Buffer.from(input, inputEncoding);
    let outputBuf = tplinkCrypto.decrypt(inputBuf, firstKey);
    console.log(outputBuf.toString());
  });
program
  .command('decryptWithHeader <inputEncoding> <input> [firstKey=0xAB]')
  .action(function (inputEncoding, input, firstKey = 0xAB) {
    let inputBuf = Buffer.from(input, inputEncoding);
    let outputBuf = tplinkCrypto.decryptWithHeader(inputBuf, firstKey);
    console.log(outputBuf.toString());
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
