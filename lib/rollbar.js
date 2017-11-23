const querystring = require('querystring');
const get = require('lodash.get');
const Rollbar = require("rollbar");

module.exports = (options) => {
  const rollbar = new Rollbar(options);

  // submit a lambda error to rollbar (async)
  const submitToRollbar = (err, environment, level, event, context) => {
    // eslint-disable-next-line no-console
    console.log(err.message);
    rollbar.configure({ payload: { environment } });
    // reference: https://github.com/Rollbar/rollbar.js/#rollbarlog-1
    rollbar[level](err.message, err, {
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
    }, {
      headers: event.headers,
      protocol: get(event, 'headers.X-Forwarded-Proto'),
      url: (
        `${get(event, 'headers.X-Forwarded-Proto')}://` +
        `${get(event, 'headers.Host')}${get(event, 'requestContext.path')}` +
        `/?${querystring.stringify(get(event, 'queryStringParameters'))}`
      ),
      method: event.httpMethod,
      body: event.body,
      route: {
        path: get(event, 'requestContext.path')
      }
    });
    return Promise.resolve(err);
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
        return handler(event, context, (err, resp) => {
          if (err) {
            rb.error(err);
          }
          return rollbar.wait(() => callback(err, resp));
        }, rb);
      } catch (err) {
        rb.error(err);
        return rollbar.wait(() => {
          throw err;
        });
      }
    }
  };
};
