const safeStringify = require('fast-safe-stringify');

module.exports = e => (typeof e === 'string' || e instanceof String ? e : safeStringify(e));
