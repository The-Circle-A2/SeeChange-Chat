global.window = {};
const JSEncrypt = require('JSEncrypt/bin/jsencrypt');
const CryptoJS = require("crypto-js");
const axios = require('axios');

function verifyMessage(msg, username){
    const verify = new JSEncrypt({default_key_size: 512});

    return new Promise((resolve, reject) => {
        axios.get('http://truyou.the-circle.designone.nl/user/' + username)
            .then((response) => {
                if (response.error) {
                    // log signature invalid
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
    sign.setPrivateKey("-----BEGIN PRIVATE KEY-----MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDPFNiZe0z8uJOUBtbdZBTQ2SVtcJ4qUtV70zgdow2pJ8b+D4gKgJDZINgLmdMDI1akdCiymKG5kOvBBDxCHPedD8aWXuTAe9JVsL1b4Eta/rNTADMb+c0Q2BC9fz/uzTJJyCZsFlUd83JgDMjE4wtcV5W1ZwSq14aT9QVOmuwDxrLxi+6A7OwFRZ4gL3pxijo5mIiblP0s8DsoUoe7FfrCqBg1mivJJ9VzZ0nwoAV32x/9FI5i36zFkGkAcA6FwGv/1aFLlfxmRBPk8hXfrW40OFImaNzurSgYEz3SVqoAJg1wHKKTwSb8NbHV8oHKMQR3FvY6qSWbqmYp0yTVRwkxAgMBAAECggEBAJtaWjyaoeEeX6i3kM46XNtpbIiz6hR6XCovBXRGdOMoMkM7R6YJWaFq4GmjlwhNpJxvgHCrzPg33oXJNaOrs5+izCrXOemleuBKXWTl2eKEHefwyGb+endegQCIzF/MlSOBAkIoZua3UmD4dk4uvsEh+/BBPuEkG5Q4Ryj3VIRnXO6DDBTh0SQbWnR2tDXzXYr3mtoAF2I4BmtKSVigpkUfOYw4ZHxLtF57afkR1mHVkwPYINkZ7KhxVlh8zNQ7Bpo1lIOpyZTD08SpJEot7e1NeKyrb8J5RlECuQEm0DGHabh2ie2mrpzs8NKTtg2USP2YssJQA1gDgLW811BsBVkCgYEA75JwjCNS0PPdEBqwlWHKRXX6klqO38yrgsT95g2d9XFFXb5mEOM9jyylDdmO/gUxfIRcsnmwmk1tccPt4v11NNYhqGZSUjxvZy7ip+xnSR2bfGaIBc8hY3vCPvo2s5kAKc6krap2ilIZhO8NSDHmNeP2qZMvqIIpMp2VRz5+QdMCgYEA3UgNF/MfVqfU7V7JgWN6aoKWgbS3FqBY1hIUSDAb1YKCfJcfMNC7kMu+KR0jgX+IwhHt1GLCgrTL4d5M2FT8e8sNTBWKaK3egJ31TpZ3SVz91rT0J88dlkH7h7j6egJtwg6/pH7m45V2Rqr+Nu7EDPlmlw4I+xhIKWipDwl+omsCgYEAoNuOvkmpfauALyP8lRDII8OHr2UmsZZXQsLKSAG0oeygSsVg+s3Zs5yiZp5BqMYL6DNnml6i+bgrWEvaGqNcY1Gz38J0W8tAcePFREMzRqCemfSuOFhPbuDWGDshJ43/0hJx+DmQxmdBw0RPgr4eeOjL4ih1w4tB5j5w0Rlg5QkCgYAS0EFsu9r6PyK3W8u+GHsb+yZYuMioP9HNwZO/33c+W+5EMYURXW3VDb2JOVT/eZxjA6s413y6KCz9cy0NZ4xf6g+jXGF8LOwx+zwUBm716dYbHx9zEwTs9YcxLuT84p/6U86vaaqvxtFbiMY8XWiFwd6bETJqRtI70w4snR4LKQKBgQCLJXtCXiohXRuM6eBZQc5sHdygl/GmNJOHoORmgoTegp0nPoDlVvZcTE52/IVT49SkwfCAQYm7Fpgy6rjw4pIp7ZGbkgtyNJYBMMsmu1T3uhxKM9z/llldjtQeXm/NjarlYC4/B0tWuOc8ysIh8z5ljjmTgPmm8DakDVUT/hawpg==-----END PRIVATE KEY-----");
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
