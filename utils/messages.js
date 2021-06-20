const moment = require('moment');

function formatMessage(username, text, info) {
  return {
    username,
    text,
    time: moment().format('DD-MM-YYYY HH:mm'),
    timeWithMilliSeconds: moment().format('DD-MM-YYYY HH:mm ss:SS'),
    info
  };
}

module.exports = formatMessage;