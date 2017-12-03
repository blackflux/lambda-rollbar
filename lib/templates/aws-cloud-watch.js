const zlib = require("zlib");
const get = require('lodash.get');

module.exports = (event) => {
  const raw = get(event, 'awslogs.data');
  let content = null;
  try {
    content = JSON.parse(String(zlib.gunzipSync(Buffer.from(raw, 'base64'))));
  } catch (error) {
    return {
      raw,
      error: error.message
    };
  }
  const logGroup = get(content, 'logGroup', '???');
  const logStream = get(content, 'logStream', '???');
  return {
    raw,
    content,
    url: `https://console.aws.amazon.com/cloudwatch/home#logEventViewer:group=${logGroup};stream=${logStream}`
  };
};
