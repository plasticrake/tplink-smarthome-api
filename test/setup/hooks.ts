/* eslint-disable import/prefer-default-export, no-console */
import { testDeviceCleanup } from './test-device-setup';

export const mochaHooks = {
  async afterAll(): Promise<void> {
    console.log('Test Device Cleanup...');
    await testDeviceCleanup();
    console.log('...Done');
  },
};
