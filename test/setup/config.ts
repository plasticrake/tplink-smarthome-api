/* eslint-disable no-console */

/**
 * Environment Variables:
 * - TEST_CLIENT_LOGLEVEL - default: 'warn'
 * - TEST_SIMULATOR - truthy value will use simulator, falsy will try to use real devices. default: true
 * - TEST_DISCOVERY_TIMEOUT - default: 2000
 * - TEST_DISCOVERY_MAC_ALLOW - CSV list of device MAC addresses to use for testing. If not specified all MACs will be valid. default: ''
 */

import dotenv from 'dotenv';
import log from 'loglevel';

dotenv.config();

const envIsTrue = function envIsTrue(value: unknown): boolean {
  return !(value == null || value === 0 || value === 'false');
};

const envHasValue = function envHasValue(value: unknown): boolean {
  return !(value == null || value === '');
};

export const testClientLogLevel = envHasValue(process.env.TEST_CLIENT_LOGLEVEL)
  ? (process.env.TEST_CLIENT_LOGLEVEL as log.LogLevelDesc)
  : 'warn';

export const useSimulator = envIsTrue(
  envHasValue(process.env.TEST_SIMULATOR) ? process.env.TEST_SIMULATOR : true
);

export const discoveryTimeout = envHasValue(process.env.TEST_DISCOVERY_TIMEOUT)
  ? Number(process.env.TEST_DISCOVERY_TIMEOUT)
  : 2000;

export const discoveryMacAllow = ((): string[] => {
  const list = process.env.TEST_DISCOVERY_MAC_ALLOW;
  if (list) return list.split(',');
  return [];
})();

export const testSendOptionsSets = [
  {
    name: 'tcp',
    timeout: useSimulator ? 100 : 8000,
    transport: 'tcp',
    useSharedSocket: false,
  },
  {
    name: 'udp',
    timeout: useSimulator ? 100 : 10000,
    transport: 'udp',
    useSharedSocket: false,
  },
  {
    name: 'udp-shared',
    timeout: useSimulator ? 100 : 10000,
    transport: 'udp',
    useSharedSocket: true,
    sharedSocketTimeout: 10000,
  },
];

export const cloudUsername = process.env.TEST_CLOUD_USERNAME || 'username';
export const cloudPassword = process.env.TEST_CLOUD_PASSWORD || 'password';
export const cloudServerUrl = process.env.TEST_CLOUD_SERVER_URL || 'tplink.com';

export const defaultTestTimeout = useSimulator ? 2000 : 11000;

console.log('Test Configuration');
console.log('=============');
console.log(`testClientLogLevel: %O`, testClientLogLevel);
console.log(`useSimulator: %O`, useSimulator);
console.log(`discoveryTimeout: %O`, discoveryTimeout);
console.log(`discoveryMacAllow: %O`, discoveryMacAllow);
console.log(`cloudUsername: %O`, cloudUsername);
console.log(`cloudPassword: %O`, cloudPassword.length > 0 ? '*'.repeat(8) : '');
console.log(`cloudServerUrl: %O`, cloudServerUrl);
console.log('defaultTestTimeout: %O', defaultTestTimeout);
console.log('');
