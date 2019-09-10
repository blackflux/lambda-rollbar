const fs = require('fs');
const path = require('path');
const get = require('lodash.get');
const Joi = require('joi-strict');
const Rollbar = require('rollbar');
const ensureString = require('./util/ensure-string');

const templates = (() => {
  const templateDir = path.join(__dirname, 'templates');
  return fs
    .readdirSync(templateDir)
    .map((f) => f.slice(0, -3))
    .reduce((p, f) => Object.assign(p, {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      [f]: require(path.join(templateDir, f))
    }), {});
})();

module.exports = (options) => {
  Joi.assert(options, Joi.object().keys({
    rollbar: Joi.object().keys({
      accessToken: Joi.string().optional(),
      environment: Joi.string().optional(),
      enabled: Joi.boolean().optional(),
      verbose: Joi.boolean().optional()
    }),
    template: Joi.string().optional()
  }));
  const rollbarOptions = get(options, 'rollbar');
  const template = templates[get(options, 'template', 'aws-sls-lambda-proxy')];
  const verbose = get(options, 'rollbar.verbose', false);
  const rollbarEnvironment = get(options, 'rollbar.environment');
  const rollbar = new Rollbar(rollbarOptions);

  const submitToRollbar = async ({
    error,
    environment,
    level,
    event,
    context
  }) => {
    const msgPrefix = [
      get(error, 'statusCode'),
      get(error, 'messageId')
    ].filter((e) => !['', undefined].includes(e)).join('@');
    const msgBody = get(error, 'message') || ensureString(error);
    const message = [msgPrefix, msgBody].filter((e) => !['', undefined].includes(e)).join(': ');
    if (verbose === true) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
    rollbar.configure({ payload: { environment } });
    // reference: https://github.com/Rollbar/rollbar.js/#rollbarlog-1
    rollbar[level](message, error, {
      context: {
        remainingTimeInMillis: context.getRemainingTimeInMillis(),
        callbackWaitsForEmptyEventLoop: context.callbackWaitsForEmptyEventLoop,
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        arn: context.invokedFunctionArn,
        requestId: context.awsRequestId,
        logGroupName: context.logGroupName,
        logStreamName: context.logStreamName,
        invokeid: context.invokeid,
        memoryLimitInMB: context.memoryLimitInMB
      },
      event
    }, template(event));
    return error;
  };

  /* Wrap Lambda function handler */
  return {
    wrap: (handler) => (event, context, callback) => {
      // eslint-disable-next-line no-param-reassign
      context.callbackWaitsForEmptyEventLoop = false;

      // Rollbar logging levels as promise
      const rb = ['debug', 'info', 'warning', 'error', 'critical']
        .reduce((final, level) => Object.assign(final, {
          [level]: (error, env = rollbarEnvironment) => submitToRollbar({
            error, env, level, event, context
          })
        }), {});

      try {
        handler(event, context, rb)
          .then((resp) => rollbar.wait(() => callback(null, resp)))
          .catch((err) => {
            try {
              rb.error(err);
            } finally {
              rollbar.wait(() => callback(err));
            }
          });
      } catch (err) {
        try {
          rb.error(err);
        } finally {
          rollbar.wait(() => callback(err));
        }
      }
    }
  };
};
