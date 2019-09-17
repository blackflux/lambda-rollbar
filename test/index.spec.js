const expect = require('chai').expect;
const Rollbar = require('../src/index');

describe('Testing Rollbar', () => {
  it('Testing Deprecated', async () => {
    expect(() => Rollbar())
      .to.throw('Deprecated: Please use lambda-async, lambda-monitor and lambda-monitor-logger instead');
  });
});
