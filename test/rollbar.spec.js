/* eslint-disable no-console */
const expect = require("chai").expect;
const Rollbar = require("../src/rollbar");

const rollbarVerbose = Rollbar({
  enabled: false,
  verbose: true
});
const rollbarNonVerbose = Rollbar({
  enabled: false,
  verbose: false
});

const consoleLogOriginal = console.log;
const logs = [];
const error = new Error("Test Error");
const response = {
  statusCode: 400,
  body: "{\"message\":\"Invalid Parameter.\"}"
};

const executeHandler = (err, resp, cb) => {
  rollbarVerbose.wrap(() => (err ? Promise.reject(err) : Promise.resolve(resp)))(
    {},
    { getRemainingTimeInMillis: () => 0 },
    (err_, resp_) => {
      expect(err_).to.equal(err);
      expect(resp_).to.equal(resp);
      expect(logs).to.deep.equal(err === null ? [] : [err.message || err]);
      cb();
    }
  );
};

describe("Testing Rollbar Wrapper", () => {
  before(() => {
    console.log = (...args) => Object.keys(args).map(k => args[k]).forEach(value => logs.push(value));
  });
  after(() => {
    console.log = consoleLogOriginal;
  });

  beforeEach(() => {
    logs.length = 0;
  });

  it("Testing Execution Without Error", (done) => {
    executeHandler(null, response, done);
  });

  it("Testing Execution With Error", (done) => {
    executeHandler(error, undefined, done);
  });

  it("Testing Execution With String Error Message", (done) => {
    executeHandler("String Error", undefined, done);
  });

  it("Testing Exception Verbose", () => {
    expect(() => rollbarVerbose.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, {})).to.throw(error);
    expect(logs).to.deep.equal([error.message]);
  });

  it("Testing Exception Non-Verbose", () => {
    expect(() => rollbarNonVerbose.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, {})).to.throw(error);
    expect(logs).to.deep.equal([]);
  });
});
