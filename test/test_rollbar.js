/* eslint-disable no-console */
const expect = require("chai").expect;
const Rollbar = require("../lib/rollbar");

const rollbarDebug = Rollbar({
  enabled: false,
  debug: true
});
const rollbarNonDebug = Rollbar({
  enabled: false,
  debug: false
});

const consoleLogOriginal = console.log;
const logs = [];
const error = new Error("Test Error");
const response = {
  statusCode: 400,
  body: "{\"message\":\"Invalid Parameter.\"}"
};
const executeHandler = (err, resp, cb) => {
  rollbarDebug.wrap((event, context, func) => func(err, resp))(
    {},
    { getRemainingTimeInMillis: () => 0 },
    (err_, resp_) => {
      expect(err_).to.equal(err);
      expect(resp_).to.equal(resp);
      expect(logs).to.deep.equal(err === null ? [] : [err.message]);
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
    executeHandler(error, response, done);
  });

  it("Testing Exception Debug", () => {
    expect(() => rollbarDebug.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, {})).to.throw(error);
    expect(logs).to.deep.equal([error.message]);
  });

  it("Testing Exception Non-Debug", () => {
    expect(() => rollbarNonDebug.wrap(() => {
      throw error;
    })({}, { getRemainingTimeInMillis: () => 0 }, {})).to.throw(error);
    expect(logs).to.deep.equal([]);
  });
});
