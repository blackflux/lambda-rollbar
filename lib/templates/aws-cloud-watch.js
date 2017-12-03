const zlib = require("zlib");
const get = require('lodash.get');

module.exports = (event) => {
  const raw = get(event, 'awslogs.data');
  const content = JSON.parse(String(zlib.gunzipSync(Buffer.from(raw, 'base64'))));
  const logGroup = content.logGroup;
  const logStream = content.logStream;
  return {
    raw,
    content,
    url: `https://console.aws.amazon.com/cloudwatch/home#logEventViewer:group=${logGroup};stream=${logStream}`
  };
};
