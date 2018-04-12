# Lambda-Rollbar Wrapper

[![Build Status](https://img.shields.io/travis/simlu/lambda-rollbar/master.svg)](https://travis-ci.org/simlu/lambda-rollbar)
[![Test Coverage](https://img.shields.io/coveralls/simlu/lambda-rollbar/master.svg)](https://coveralls.io/github/simlu/lambda-rollbar?branch=master)
[![Greenkeeper Badge](https://badges.greenkeeper.io/simlu/lambda-rollbar.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/simlu/lambda-rollbar/status.svg)](https://david-dm.org/simlu/lambda-rollbar)
[![NPM](https://img.shields.io/npm/v/lambda-rollbar.svg)](https://www.npmjs.com/package/lambda-rollbar)
[![Downloads](https://img.shields.io/npm/dt/lambda-rollbar.svg)](https://www.npmjs.com/package/lambda-rollbar)
[![Semantic-Release](https://github.com/simlu/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)
[![Gitter](https://github.com/simlu/js-gardener/blob/master/assets/icons/gitter.svg)](https://gitter.im/simlu/lambda-rollbar)

Rollbar wrapper for Serverless, API Gateway and Lambda.

## Getting Started

To install run `npm install --save lambda-rollbar`

## Usage

Define rollbar and wrap handlers with
<!-- eslint-disable import/no-extraneous-dependencies, import/no-unresolved -->
```javascript
const rollbar = require('lambda-rollbar')({
  accessToken: "YOUR_ROLLBAR_ACCESS_TOKEN",
  environment: "YOUR_ENVIRONMENT",
  enabled: true,
  template: 'aws-sls-lambda-proxy'
});

exports.handler = rollbar.wrap((event, context, rb) => rb
  .warning("Some Warning...")
  .then({ statusCode: 200, body: "{\"message\":\"Hello World.\"}" }));
```

Available log levels are `debug`, `info`, `warning`, `error` and `critical`.

You can set an environment on a per call bases using `rb.warning("YOUR_MESSAGE", "YOUR_ENVIRONMENT")`.

## Verbose Option

Use the boolean `verbose` option to log messages to console. This option also get's passed through into [rollbar](https://github.com/rollbar/rollbar.js#verbose-option).

## Request Templates

Lambda functions are called in different [request context](https://rollbar.com/docs/notifier/rollbar.js/#rollbarlog-1). Using the `template` option you can define which request context should be assumed. Currently supported are:

- `aws-sls-lambda-proxy` (*default*) - Default event template for API Gateway using the [Serverless Framework](https://serverless.com/framework/docs/providers/aws/events/apigateway/)
- `aws-cloud-watch` - For [CloudWatch logs](http://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-cloudwatch-logs) events

## Contributions / What is next

- **Templates** - Adding more templates is easy and PRs are welcome! Sample events can be found [here](http://docs.aws.amazon.com/lambda/latest/dg/eventsources.html). Make sure you only use fields listed under [request](https://rollbar.com/docs/notifier/rollbar.js/#rollbarlog-1), i.e. `url`, `method`, `body`.
