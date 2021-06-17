const formatMessage = require('./messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getStreamUsers
} = require('./users');
global.window = {};
const JSEncrypt = require('JSEncrypt/bin/jsencrypt');
const CryptoJS = require("crypto-js");

function startChatServer(io) {
    const botName = 'Bot';

    io.on('connection', socket => {

        socket.on('joinstream', ({ username, stream }) => {
            const user = userJoin(socket.id, username, stream);

            socket.join(user.stream);

            socket.emit('message', formatMessage(botName, 'Welcome to test chat server!'));

            socket.broadcast
            .to(user.stream)
            .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`)
            );

            io.to(user.stream).emit('streamUsers', {
                stream: user.stream,
                users: getStreamUsers(user.stream)
            });
        });

        socket.on('chatMessage', msg => {
            const user = getCurrentUser(socket.id);
            const verify = new JSEncrypt({default_key_size: 512});
            verify.setPublicKey("-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLfU6pzx5ytxZVO4S8SXaW9p0NKp/PTZwVCU//BdeZQNjO88/9Q35qkvP/pJ0O3shI3EKStQPobFDmPqjta50GDFdFA3hzuumj+zUSQumKCznBcAL2qEVXPYYbk25MFePYQXgf6d7yleSGilECUCpfDT13JwxqBkrxEbeebc/4gQIDAQAB-----END PUBLIC KEY-----");
            const verified = verify.verify(msg.message + msg.timestamp, msg.signature, CryptoJS.SHA256);

            if (verified) {
                io.to(user.stream).emit('message', formatMessage(user.username, msg.message));
            }
        });

        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if (user) {
            io.to(user.stream).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat`)
            );

            io.to(user.stream).emit('streamUsers', {
                stream: user.stream,
                users: getStreamUsers(user.stream)
            });
            }
        });
    });
  }
  
  module.exports = startChatServer;