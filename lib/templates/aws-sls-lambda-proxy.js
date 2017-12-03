const querystring = require('querystring');
const get = require('lodash.get');

module.exports = event => ({
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
