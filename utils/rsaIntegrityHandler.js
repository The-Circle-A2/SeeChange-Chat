global.window = {};
const JSEncrypt = require('JSEncrypt/bin/jsencrypt');
const CryptoJS = require("crypto-js");
const axios = require('axios');
const {logError} = require('./logmanager');
function verifyMessage(msg, username){
    const verify = new JSEncrypt({default_key_size: 512});

    return new Promise((resolve, reject) => {
        axios.get('http://truyou.the-circle.designone.nl/user/' + username)
            .then((response) => {
                if (response.error) {
                    logError(signMessage(response.error));
                }

                if (response.data.public_key) {// username exists
                    verify.setPublicKey(response.data.public_key);

                    if(verify.verify(msg.message + msg.timestamp, msg.signature, CryptoJS.SHA256)) {
                        return resolve();
                    }
                }

                return reject();
            });
    });
}

function signMessage(msg){
    const sign = new JSEncrypt();
    sign.setPrivateKey(process.env.PRIVATE_KEY);
    const timestamp = Date.now();
    const signature = sign.sign(msg + timestamp, CryptoJS.SHA256, "sha256");

    const messageWithSig = {
        message: msg,
        signature: signature,
        timestamp: timestamp,
    };

    return messageWithSig;
}

module.exports = {
    verifyMessage,
    signMessage
};
