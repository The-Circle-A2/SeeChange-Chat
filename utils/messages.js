const moment = require('moment');

function formatMessage(username, text, stream, info) {
  return {
    username,
    text,
    stream,
    time: moment().format('DD-MM-YYYY HH:mm'),
    timeWithMilliSeconds: moment().format('DD-MM-YYYY HH:mm ss:SS'),
    info
  };
}

module.exports = formatMessage;