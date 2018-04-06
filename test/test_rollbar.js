/* eslint-disable no-console */
const expect = require("chai").expect;
const Rollbar = require("../lib/rollbar");

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
  rollbarVerbose.wrap((event, context, func) => func(err, resp))(
    {},
    { getRemainingTimeInMillis: () => 0 },
    (err_, resp_) => {
      expect(err_).to.equal(err);
      expect(resp_).to.equal(resp);
      expect(logs).to.deep.equal(err === null ? [] : [err.message]);
      setTimeout(cb, 100);
    }
  );
};

const executeHandlerPromise = (err, resp, cb) => {
  rollbarVerbose.wrap(() => (err ? Promise.reject(err) : Promise.resolve(resp)))(
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

  it("Testing Execution Without Error (Promise)", (done) => {
    executeHandlerPromise(null, response, done);
  });

  it("Testing Execution With Error (Promise)", (done) => {
    executeHandlerPromise(error, undefined, done);
  });

  it("Testing Callback and Promise", (done) => {
    let called = false;
    rollbarVerbose.wrap((event, context, cb) => {
      cb(null, response);
      return Promise.resolve(response);
    })(
      {},
      { getRemainingTimeInMillis: () => 0 },
      (err_, resp_) => {
        expect(err_).to.equal(null);
        expect(resp_).to.equal(response);
        if (called === true) {
          expect(logs).to.deep.equal(["Logical Bug: Can only use Callback or Promise. Not both."]);
          done();
        }
        called = true;
      }
    );
  });

  it("Testing Promise and Callback", (done) => {
    let called = false;
    rollbarVerbose.wrap((event, context, cb) => {
      setTimeout(() => cb(null, response), 200);
      return Promise.resolve(response);
    })(
      {},
      { getRemainingTimeInMillis: () => 0 },
      (err_, resp_) => {
        expect(err_).to.equal(null);
        expect(resp_).to.equal(response);
        if (called === true) {
          expect(logs).to.deep.equal(["Logical Bug: Can only use Callback or Promise. Not both."]);
          done();
        }
        called = true;
      }
    );
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
