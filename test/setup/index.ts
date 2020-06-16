import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import chaiSubset from 'chai-subset';
import * as config from './config';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
chai.use(sinonChai);

export { expect };

export {
  getTestClient,
  testDevices,
  testDeviceCleanup,
} from './test-device-setup';

export { config };
