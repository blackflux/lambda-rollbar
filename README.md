# Lambda-Rollbar Wrapper

[![Build Status](https://img.shields.io/travis/simlu/lambda-rollbar/master.svg)](https://travis-ci.org/simlu/lambda-rollbar)
[![Test Coverage](https://img.shields.io/coveralls/simlu/lambda-rollbar/master.svg)](https://coveralls.io/github/simlu/lambda-rollbar?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/simlu/lambda-rollbar.svg)](https://greenkeeper.io/)
[![NPM](https://img.shields.io/npm/v/lambda-rollbar.svg)](https://www.npmjs.com/package/lambda-rollbar)
[![Downloads](https://img.shields.io/npm/dt/lambda-rollbar.svg)](https://www.npmjs.com/package/lambda-rollbar)
[![Semantic-Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/lambda-rate-limiter)
[![Gitter](https://img.shields.io/gitter/room/simlu/lambda-rollbar.svg)](https://gitter.im/simlu/lambda-rollbar)

Rollbar wrapper for Serverless, API Gateway and Lambda.

## Getting Started

To install run `npm install --save lambda-rollbar`

## Setup

Define rollbar as
```javascript
const rollbar = require('lambda-rollbar')({
  accessToken: ROLLBAR_ACCESS_TOKEN,
  environment: ENVIRONMENT,
  enabled: true,
  captureUncaught: true,
  captureUnhandledRejections: true
});
```

Wrap lambda handler with
```javascript
exports.handler = rollbar.wrap((event, context, callback, rb) => rb
  .warning("Some Warning...")
  .then(callback(null, { statusCode: 200, body: "{\"message\":\"Hello World.\"}" })));
```
