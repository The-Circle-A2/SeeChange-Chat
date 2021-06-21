global.window = {};
const JSEncrypt = require('JSEncrypt/bin/jsencrypt');
const CryptoJS = require("crypto-js");
const axios = require('axios');

await function verifyMessage(msg, username){
    const verify = new JSEncrypt({default_key_size: 512});

    axios.get('http://truyou.the-circle.designone.nl/user/' + username)
        .then((response) => {
            if(response.error) {
                // log signature invalid
            }

            if(response.public_key) {// username exists
                verify.setPublicKey(response.public_key);

                const verified = verify.verify(msg.message + msg.timestamp, msg.signature, CryptoJS.SHA256);

                return verified
            }

            // uncaught error?
        });
}

function signMessage(msg){
    const sign = new JSEncrypt();
    sign.setPrivateKey(
        "-----BEGIN RSA PRIVATE KEY-----MIICXQIBAAKBgQCiR3875y761+typ4UH7qgDI+Rwyqkh9BiRydylaAvthjSJ1Uc8ywOLcwr4FxlpXuTufsxCW7FN44maY5kAD6KK2n85haJGnU5FgqYn30Jkzwbt8m9cxpUDn4oMP6kP/x0t/vfajfYcmhR+ljqzGEWezjJ0RF+QC2UIzRDZxV2liwIDAQABAoGAdl/tIgdLr9Ndfq9QTS78A/5knxpWMdxbJ822VDoHqWYiYQDhDCmTFl/++mXvNXvxRz/bQ/Sa65Q1Rhes/expxewAKmZ+G8jKt46sXWDftR82ld3jA832NcIMBzs+cLIwyB6bCqSU6xsgK+MXloWWsaS8PPEZc9nXd29YCj8jw7ECQQD70KccuCNysp2w35oM4X4rdnn8NQ7gfk2FVoIZvEgPQeC5EXj8VeUTWtUNQwrh1kN2AGQsnxO1Japvi1cQBqyHAkEApPnqDnoe2HMFJjPcB6pZjUHLFbMXwTbaeNMs48gyNVs4SOn2V8MniTw4y5jKVsXE0bYYzbOACR48Y5YPRSnj3QJBAKebQK+/7HA6bPU+T0YFjLoXGKiDFEzeJHD8nInOpVPqcE4eUB38egXA7o/uML8So0JWjlaY50AqOuAVqbRUDN8CQHrm73YfhhEsBt8B7V4MizBPnnKo+/5l1fYDJEMBJl5XeaPgIDQbX72+DnWmer6QEONGLE459h1U2Bo8dV3KKkUCQQDe1yUQtd0C4EHkdy/9yjw+494dHq/9FLaQCdqAGEXJPjSnCOUl73b5tNVa2nKJGLCTxenUWUZk6PvsI1QQoRkf-----END RSA PRIVATE KEY-----"
    );
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
