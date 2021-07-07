global.window = {};
const JSEncrypt = require('jsencrypt')
const CryptoJS = require("crypto-js");
const axios = require('axios');
const {logError} = require('./logmanager');
let lastUpdate;
let userMap = new Map();

function verifyMessage(msg, username){
    const verify = new JSEncrypt({default_key_size: 512});

    if (Date.now() - lastUpdate > 900000) {
        userMap.clear();
    }

    userMap.set("j.jansen", "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyYCtUTlrCDjKJ2HrDpe2CzotqZw5imLe6BdDmgniGuuLVYxG3Y40lcCSDfuUZXcaf53YgYZ08/j3tbU1yslkoW0KdGx0Sf4MC6VCKFVyGHSp6JRiwhjHI+PBzxlQTqBDQC+WPHpRDLAxKS1lBrO2AQ/CO9uSGABZy5IGgsIEoTd1W9BYpAdn7o3olke45qVXr56UsHN+o9e3mSo2b5g2qjVjfUmItYMru+zPgfk9rqcmzNbff5wUwKvfjc8Rr9jOxoy1bi9PGlScwejABWff3dfFt16piFwECQWN2bdaKXsdC06dbua5JTV+/Ohko338Fzeu3Xg5qGMt84KecRrwmwIDAQAB-----END PUBLIC KEY-----");
    return new Promise((resolve, reject) => {
        let username = "j.jansen";

        if (userMap.has(username)){
            verify.setPublicKey(userMap.get(username));

            if(verify.verify(msg.message + msg.timestamp, msg.signature, CryptoJS.SHA256)) {
                return resolve();
            }
        } else {
            axios.get('http://127.0.0.1:8000/user/' + username)
            .then((response) => {
                /*
                Verify TruYou signature: Bart
                 */
                const verify = new JSEncrypt({default_key_size: 512});
                verify.setPublicKey(process.env.PUBLIC_KEY);
                if(verify.verify(response.body + response.headers['X-timestamp'], response.headers['X-signature'], CryptoJS.SHA256)) {

                    if (response.data.public_key) {// username exists
                        userMap.set(username, response.data.public_key);
                        lastUpdate = Date.now();
                        verify.setPublicKey(response.data.public_key);

                        if (verify.verify(msg.message + msg.timestamp, msg.signature, CryptoJS.SHA256)) {
                            return resolve();
                        }
                    }
                }

                logError(signMessage('[SYSTEM] Invalid signature received from ' + username));

                return reject();
            });
        }
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
