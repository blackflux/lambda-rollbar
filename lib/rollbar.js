const get = require('lodash.get');
const omit = require('lodash.omit');
const Rollbar = require("rollbar");
const ensureString = require("./util/ensureString");

const templateSlsLambdaProxy = require(`./templates/aws-sls-lambda-proxy`);
const templateAwsCloudWatch = require(`./templates/aws-cloud-watch`);

const templates = {
  "aws-sls-lambda-proxy": templateSlsLambdaProxy,
  "aws-cloud-watch": templateAwsCloudWatch
};

module.exports = (options) => {
  const rollbar = new Rollbar(omit(options, ['template']));
  const template = templates[get(options, 'template', "aws-sls-lambda-proxy")];

  // submit a lambda error to rollbar (async)
  const submitToRollbar = (obj, environment, level, event, context) => {
    const message = get(obj, 'message', ensureString(obj));
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
    wrap: handler => (event, context, callback) => {
      // eslint-disable-next-line no-param-reassign
      context.callbackWaitsForEmptyEventLoop = false;

      // Rollbar logging levels as promise
      const rb = ["debug", "info", "warning", "error", "critical"].reduce((final, level) => Object.assign(final, {
        [level]: (err, env = options.environment) => submitToRollbar(err, env, level, event, context)
      }), {});

      try {
        let usesCallback = false;
        let usesPromise = false;
        const response = handler(event, context, (err, resp) => {
          usesCallback = true;
          if (usesPromise) {
            rb.error("Logical Bug: Can only use Callback or Promise. Not both.");
          }
          if (err) {
            rb.error(err);
          }
          return rollbar.wait(() => callback(err, resp));
        }, rb);
        usesPromise = response !== undefined && typeof response.then === 'function';
        if (usesPromise && usesCallback) {
          rb.error("Logical Bug: Can only use Callback or Promise. Not both.");
        }
        return usesPromise ? rollbar.wait(() => response.then(resp => callback(null, resp)).catch((err) => {
          rb.error(err);
          callback(err);
        })) : response;
      } catch (err) {
        rb.error(err);
        return rollbar.wait(() => {
          throw err;
        });
      }
    }
  };
};
