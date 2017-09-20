#! /usr/bin/env node

const program = require('commander');

const Hs100Api = require('.');
const client = new Hs100Api.Client();

let logLevel;

let search = function (sysInfo, timeout) {
  console.log('Searching...');
  if (logLevel) client.log.setLevel(logLevel);
  client.startDiscovery({discoveryInterval: 2500, discoveryTimeout: timeout})
    .on('device-new', (device) => {
      console.log(`${device.model} ${device.type} ${device.host} ${device.port} ${device.deviceId} ${device.name}`);
      if (sysInfo) {
        console.dir(device.sysInfo, {colors: program.color === 'on', depth: 10});
      }
    });
};

let send = function (host, port, payload, timeout) {
  console.log('Sending...');
  if (logLevel) client.log.setLevel(logLevel);
  client.send({host, port, payload, timeout}).then((data) => {
    console.log('response:');
    console.dir(data, {colors: program.color === 'on', depth: 10});
  }).catch((reason) => {
    console.log('no response: %s', reason);
  });
};

let details = function (host, port, timeout) {
  console.log('Getting details...');
  if (logLevel) client.log.setLevel(logLevel);
  client.getDevice({host, port}).then((device) => {
    return device.getInfo().then((info) => {
      console.dir(info, {colors: program.color === 'on', depth: 10});
    });
  }).catch((reason) => {
    console.error(reason);
  });
};

let blink = function (host, port, times, rate, timeout) {
  console.log('Sending blink commands...');
  if (logLevel) client.log.setLevel(logLevel);
  client.getDevice({host, port}).then((device) => {
    return device.blink(times, rate).then(() => {
      console.log('Blinking complete');
    });
  }).catch((reason) => {
    console.error(reason);
  });
};

let toInt = (s) => {
  return parseInt(s);
};

program
  .option('-D, --debug', 'turn on debug level logging', () => { logLevel = 'debug'; })
  .option('-c, --color [on]', 'output will be styled with ANSI color codes', 'on');

program
  .command('search')
  .option('-s, --sysinfo', 'output sysInfo')
  .option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 5000)
  .action(function (options) {
    search(options.sysinfo, options.timeout);
  });

program
  .command('send <host> <payload>')
  .option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 5000)
  .action(function (host, payload, options) {
    let [hostOnly, port] = host.split(':');
    send(hostOnly, port, payload, options.timeout);
  });

program
  .command('details <host>')
  .option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 5000)
  .action(function (host, options) {
    let [hostOnly, port] = host.split(':');
    details(hostOnly, port, options.timeout);
  });

program
  .command('blink <host> [times] [rate]')
  .option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 5000)
  .action(function (host, times = 5, rate = 500, options) {
    let [hostOnly, port] = host.split(':');
    blink(hostOnly, port, times, rate, options.timeout);
  });

program.parse(process.argv);
