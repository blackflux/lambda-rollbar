const get = require('lodash.get');

module.exports = event => ({
  data: get(event, 'awslogs.data')
});
