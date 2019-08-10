const get = require('lodash.get');
const omit = require('lodash.omit');
const Rollbar = require('rollbar');
const ensureString = require('./util/ensure-string');

const templateSlsLambdaProxy = require('./templates/aws-sls-lambda-proxy');
const templateAwsCloudWatch = require('./templates/aws-cloud-watch');

const templates = {
  'aws-sls-lambda-proxy': templateSlsLambdaProxy,
  'aws-cloud-watch': templateAwsCloudWatch
};

module.exports = (options) => {
  const rollbar = new Rollbar(omit(options, ['template']));
  const template = templates[get(options, 'template', 'aws-sls-lambda-proxy')];

  // submit a lambda error to rollbar (async)
  const submitToRollbar = (obj, environment, level, event, context) => {
    const msgPrefix = [
      get(obj, 'statusCode'),
      get(obj, 'messageId')
    ].filter((e) => !['', undefined].includes(e)).join('@');
    const msgBody = get(obj, 'message') || ensureString(obj);
    const message = [msgPrefix, msgBody].filter((e) => !['', undefined].includes(e)).join(': ');
    if (get(options, 'verbose', false) === true) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
    rollbar.configure({ payload: { environment } });
    // reference: https://github.com/Rollbar/rollbar.js/#rollbarlog-1
    rollbar[level](message, obj, {
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
    return Promise.resolve(obj);
  };

  /* Wrap Lambda function handler */
  return {
    wrap: (handler) => (event, context, callback) => {
      // eslint-disable-next-line no-param-reassign
      context.callbackWaitsForEmptyEventLoop = false;

      // Rollbar logging levels as promise
      const rb = ['debug', 'info', 'warning', 'error', 'critical'].reduce((final, level) => Object.assign(final, {
        [level]: (err, env = options.environment) => submitToRollbar(err, env, level, event, context)
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
          rollbar.wait(() => {
            throw err;
          });
        }
      }
    }
  };
};
