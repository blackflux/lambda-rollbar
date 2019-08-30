const expect = require('chai').expect;
const uuid = require('uuid/v4');
const { describe } = require('node-tdd');
const Rollbar = require('../src/index');

describe('Testing Rollbar Wrapper', { record: console }, () => {
  let error;
  let rollbarVerbose;
  let rollbarNonVerbose;
  let executeHandler;

  before(() => {
    error = new Error(uuid());
    rollbarVerbose = Rollbar({
      enabled: false,
      verbose: true
    });
    rollbarNonVerbose = Rollbar({
      enabled: false,
      verbose: false
    });
    executeHandler = (err, resp) => new Promise((resolve) => {
      const handler = rollbarVerbose.wrap(() => (err ? Promise.reject(err) : Promise.resolve(resp)));
      handler(
        {},
        { getRemainingTimeInMillis: () => 0 },
        (err_, resp_) => {
          resolve([err_, resp_]);
        }
      );
    });
  });

  it('Testing Execution Without Error', async ({ recorder }) => {
    const response = {
      statusCode: 400,
      body: '{"message":"Invalid Parameter."}'
    };
    const [err, resp] = await executeHandler(null, response);
    expect(err).to.equal(null);
    expect(resp).to.equal(response);
    expect(recorder.get()).to.deep.equal([]);
  });

  it('Testing Execution With Error', async ({ recorder }) => {
    const [err, resp] = await executeHandler(error, undefined);
    expect(err).to.equal(error);
    expect(resp).to.equal(undefined);
    expect(recorder.get()).to.deep.equal([error.message]);
  });

  it('Testing Execution With String Error Message', async ({ recorder }) => {
    const [err, resp] = await executeHandler('String Error', undefined);
    expect(err).to.equal('String Error');
    expect(resp).to.equal(undefined);
    expect(recorder.get()).to.deep.equal(['String Error']);
  });

  it('Testing Exception Verbose', ({ capture, recorder }) => {
    capture(() => rollbarVerbose.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, {}));
    expect(recorder.get()).to.deep.equal([error.message]);
  });

  it('Testing Exception Non-Verbose', ({ capture, recorder }) => {
    capture(() => rollbarNonVerbose.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, {}));
    expect(recorder.get()).to.deep.equal([]);
  });
});
