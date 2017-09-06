#! /usr/bin/env node

const program = require('commander');

const Hs100Api = require('.');
const client = new Hs100Api.Client();

let debug = false;

let search = function (sysInfo, timeout) {
  console.log('Searching...');
  client.debug = debug;
  client.startDiscovery({discoveryInterval: 2500, discoveryTimeout: timeout})
    .on('device-new', (device) => {
      console.log(`${device.model} ${device.type} ${device.host} ${device.deviceId}`);
      if (sysInfo) {
        console.dir(device.sysInfo);
      }
    });
};

let send = function (host, port, payload, timeout) {
  console.log('Sending...');
  client.send({host, port, payload, timeout, debug}).then((data) => {
    console.log('response:');
    console.dir(data);
  }).catch((reason) => {
    console.log('no response: %s', reason);
  });
};

let details = function (host, port, timeout) {
  console.log('Getting details...');
  client.getDevice({host, port, debug}).then((device) => {
    device.getInfo().then((info) => {
      console.dir(info, {colors: program.color === 'on'});
    });
  });
};

let blink = function (host, port, times, rate, timeout) {
  console.log('Sending blink commands...');
  client.getDevice({host, port, debug}).then((device) => {
    device.blink(times, rate).then(() => {
      console.log('Blinking complete');
    });
  });
};

program
  .option('-D, --debug', 'turn on debug level logging', () => { debug = true; })
  .option('-c, --color [on]', 'output will be styled with ANSI color codes', 'on');

program
  .command('search')
  .option('-s, --sysinfo', 'output sysInfo')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (options) {
    search(options.sysinfo, options.timeout);
  });

program
  .command('send <host> <payload>')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (host, payload, options) {
    let [hostOnly, port] = host.split(':');
    send(hostOnly, port, payload, options.timeout);
  });

program
  .command('details <host>')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (host, options) {
    let [hostOnly, port] = host.split(':');
    details(hostOnly, port, options.timeout);
  });

program
  .command('blink <host> [times] [rate]')
  .option('-t, --timeout [timeout]', 'timeout (ms)', 5000)
  .action(function (host, times, rate, options) {
    let [hostOnly, port] = host.split(':');
    blink(hostOnly, port, times, rate, options.timeout);
  });

program.parse(process.argv);
