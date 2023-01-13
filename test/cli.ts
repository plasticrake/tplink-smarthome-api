import { prepareEnvironment } from '@gmrchk/cli-testing-library';

import { expect } from './setup';

const runner = 'ts-node';
const cli = './src/cli.ts';

describe('cli', function () {
  // @ts-expect-error: buildable
  let { execute, cleanup }: Awaited<ReturnType<typeof prepareEnvironment>> = {};

  beforeEach(async () => {
    ({ execute, cleanup } = await prepareEnvironment());
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('when run without arguments', function () {
    it('returns non-zero code & outputs help', async function () {
      const { code, stderr } = await execute(runner, cli);
      expect(code).to.not.equal(0);
      expect(stderr[0]).to.include('Usage:');
      expect(
        stderr.some((x) => x.includes('Commands:')),
        'outputs Commands'
      ).to.be.true;
    });
  });

  describe('--help', function () {
    it('returns zero code & outputs help', async function () {
      const { code, stdout } = await execute(runner, `${cli} --help`);
      expect(code).to.equal(0);
      expect(stdout[0]).to.include('Usage:');
      expect(
        stdout.some((x) => x.includes('Commands:')),
        'outputs Commands'
      ).to.be.true;
    });
  });

  describe('search', function () {
    it('returns zero code & outputs Searching...', async function () {
      this.timeout(20000);
      const { code, stdout } = await execute(runner, `${cli} search`);
      expect(code).to.equal(0);
      expect(stdout[0]).to.include('Searching...');
    });
  });

  describe('encrypt', function () {
    it('returns zero code & outputs encrypted result', async function () {
      const { code, stdout } = await execute(
        runner,
        `${cli} encrypt base64 test`
      );
      expect(code).to.equal(0);
      expect(stdout.join()).to.equal('37rJvQ==');
    });
  });

  describe('encryptWithHeader', function () {
    it('returns zero code & outputs encrypted result', async function () {
      const { code, stdout } = await execute(
        runner,
        `${cli} encryptWithHeader base64 test`
      );
      expect(code).to.equal(0);
      expect(stdout.join()).to.equal('AAAABN+6yb0=');
    });
  });

  describe('decrypt', function () {
    it('returns zero code & outputs decrypted result', async function () {
      const { code, stdout } = await execute(
        runner,
        `${cli} decrypt base64 37rJvQ==`
      );
      expect(code).to.equal(0);
      expect(stdout.join()).to.equal('test');
    });
  });

  describe('decryptWithHeader', function () {
    it('returns zero code & outputs decrypted result', async function () {
      const { code, stdout } = await execute(
        runner,
        `${cli} decryptWithHeader base64 AAAABN+6yb0=`
      );
      expect(code).to.equal(0);
      expect(stdout.join()).to.equal('test');
    });
  });
});
