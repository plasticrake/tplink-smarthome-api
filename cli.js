#! /usr/bin/env node

const program = require('commander');

const Hs100Api = require('.');
const client = new Hs100Api.Client();

var search = function search (sysInfo, timeout) {
  console.log('Searching...');
  client.startDiscovery(3000, timeout)
    .on('plug-new', (plug) => {
      console.log(`${plug.model} ${plug.type} ${plug.host} ${plug.deviceId}`);
      if (sysInfo) {
        console.dir(plug.sysInfo);
      }
    });
};

program
  .version(process.env.npm_package_version)
  .command('search')
  .option('-s, --sysinfo', 'Output sysInfo')
  .option('-t, --timeout [timeout]', 'Timeout (ms)', 10000)
  .action(function (options) { search(options.sysinfo, options.timeout); });

program.parse(process.argv);
