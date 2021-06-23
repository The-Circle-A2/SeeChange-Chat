const formatMessage = require('./messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getStreamUsers
} = require('./users');
const {logError} = require('./logmanager');
const {verifyMessage, signMessage} = require('./rsaIntegrityHandler');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const ObjectID = mongo.ObjectID;

function startChatServer(io) {
    const botName = '';

    io.on('connection', socket => {

        socket.on('joinstream', (message) => {
            verifyMessage(message, message.username)
                .then(() => {
                    const user = userJoin(socket.id, message.username, message.stream);
                    socket.join(user.stream);

                    socket.emit('message', signMessage(formatMessage(botName, 'Welcome to the chat!', user.stream, true)));

                    socket.broadcast
                    .to(user.stream)
                    .emit(
                        'message',
                        signMessage(formatMessage(botName, `${user.username} has joined the chat`, user.stream, true))
                    );
                    logError(signMessage(`[SYSTEM] ${user.username} has joined the chat`));

                    io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
                })
                .catch(() => {
                    //
                });
        });

        socket.on('chatMessage', msg => {
            verifyMessage(msg, msg.username)
                .then(() => {
                    const user = getCurrentUser(socket.id);
                    emitMessage(user, formatMessage(user.username, msg.message, user.stream, false));
                    SaveMongoDB(msg, user, msg.signature, true);

                    logError(signMessage(`[MESSAGE] ${user.username} send: ${msg.message}`));
                });
        });

        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if (user) {
                emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, user.stream, true));
                logError(signMessage(`[SYSTEM] ${user.username} has left the chat`));
                io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
            }
        });

        socket.on('disconnectUserFromStream', msg => {
            verifyMessage(msg, msg.username)
                .then(() => {
                    const user = userLeave(msg.message);

                    if (user) {
                        emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, user.stream, true));
                        logError(signMessage(`[SYSTEM] ${user.username} has left the chat`));
                        io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
                    }
                });
        });
    });

    function emitMessage(user, message){
        io.to(user.stream).emit('message', signMessage(message));
    }

    function SaveMongoDB(message, user, signature, verified){
        console.log(message);

        //, { useNewUrlParser: true, useUnifiedTopology: true }
        MongoClient.connect(process.env.MONGODB_URL, (err, client) => {
            if (err) throw err;

                const db = client.db("seechange_chat");
                let document = {_id: new ObjectID(), message: message.message, username: user.username, verified: verified, time: message.timestamp, stream: user.stream, signature: signature };

                db.collection('chats').insertOne(document).then((saveObject) => {
            }).catch((err) => {
                // console.log(err);
                console.log('chat save error');
            }).finally(() => {
                console.log('chat save done');
                //client.close();
            });
        });
    }
}



module.exports = startChatServer;
