const expect = require('chai').expect;
const uuid = require('uuid/v4');
const { describe } = require('node-tdd');
const Rollbar = require('../src/index');

describe('Testing Rollbar Wrapper', { record: console, useNock: true }, () => {
  let error;
  let rollbarVerbose;
  let rollbarNonVerbose;
  let executeHandler;

  before(() => {
    error = new Error(uuid());
    rollbarVerbose = Rollbar({
      accessToken: process.env.ACCESS_TOKEN,
      environment: 'local',
      enabled: true,
      verbose: true
    });
    rollbarNonVerbose = Rollbar({
      accessToken: process.env.ACCESS_TOKEN,
      environment: 'local',
      enabled: true,
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
    expect(recorder.get()).to.deep.equal([
      error.message,
      error,
      'Successful api response. Link: https://rollbar.com/occurrence/uuid/?uuid=9320983b-22d4-4157-893a-79e02d6081bb'
    ]);
  });

  it('Testing Execution With String Error Message', async ({ recorder }) => {
    const [err, resp] = await executeHandler('String Error', undefined);
    expect(err).to.equal('String Error');
    expect(resp).to.equal(undefined);
    expect(recorder.get()).to.deep.equal([
      'String Error',
      'String Error',
      'Successful api response. Link: https://rollbar.com/occurrence/uuid/?uuid=d56af703-6de0-4cf7-fce7-942fb9564467'
    ]);
  });

  it('Testing Exception Verbose', async ({ capture, recorder }) => {
    await capture(() => new Promise((resolve, reject) => rollbarVerbose.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, reject)));
    expect(recorder.get()).to.deep.equal([error.message, error]);
  });

  it('Testing Exception Non-Verbose', async ({ capture, recorder }) => {
    await capture(() => new Promise((resolve, reject) => rollbarNonVerbose.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, reject)));
    expect(recorder.get()).to.deep.equal([]);
  });
});
