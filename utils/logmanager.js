const axios = require('axios');

function logError(message) {
    axios.post(process.env.LOGSERVER_URL, message)
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
}

module.exports = {
    logError
};