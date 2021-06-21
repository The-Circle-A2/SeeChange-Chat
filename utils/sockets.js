const formatMessage = require('./messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getStreamUsers
} = require('./users');

const {verifyMessage, signMessage} = require('./rsaIntegrityHandler');

function startChatServer(io) {
    const botName = '';

    io.on('connection', socket => {

        socket.on('joinstream', (message) => {
            const verified = verifyMessage(message, message.username);

            if (verified) {x
                const user = userJoin(socket.id, message.username, message.stream);

                socket.join(user.stream);

                socket.emit('message', signMessage(formatMessage(botName, 'Welcome to the chat!', true)));

                socket.broadcast
                .to(user.stream)
                .emit(
                    'message',
                    signMessage(formatMessage(botName, `${user.username} has joined the chat`, true))
                );

                io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
            }
        });

        socket.on('chatMessage', msg => {
            const verified = verifyMessage(msg);

            if (verified) {
                const user = getCurrentUser(socket.id);
                emitMessage(user, formatMessage(user.username, msg.message, false));
            }
        });

        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if (user) {
                emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, true));
                io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
            }
        });

        socket.on('disconnectUserFromStream', msg => {
            const verified = verifyMessage(msg);

            if (verified) {
                const user = userLeave(msg.message);

                if (user) {
                    emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, true));
                    io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
                }
            }
        });
    });

    function emitMessage(user, message){
        io.to(user.stream).emit('message', signMessage(message));
    }
  }

  module.exports = startChatServer;
