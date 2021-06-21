const formatMessage = require('./messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getStreamUsers
} = require('./users');

const {verifyMessage, signMessage} = require('./rsaIntegrityHandler');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const ObjectID = mongo.ObjectID;

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

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
                    SaveMongoDB(msg.message, user, msg.signature, true);
                });
        });

        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if (user) {
                emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, user.stream, true));
                io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
            }
        });

        socket.on('disconnectUserFromStream', msg => {
            verifyMessage(msg, msg.username)
                .then(() => {
                    const user = userLeave(msg.message);

                    if (user) {
                        emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, user.stream, true));
                        io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
                    }
                });
        });
    });

    function emitMessage(user, message){
        io.to(user.stream).emit('message', signMessage(message));
    }

    function SaveMongoDB(message, user, signature, verified){
        MongoClient.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
            if (err) throw err;

                const db = client.db("chat_room");
                let document = {_id: new ObjectID(), message: message.text, user_id: user.id, verified: verified, time: message.timeWithMilliSeconds, stream: user.stream, signature: signature };

                db.collection('chat_history').insertOne(document).then((saveObject) => {
                console.log('Message inserted')
                console.log(saveObject);
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                //client.close();
            });
        });
    }
}



module.exports = startChatServer;
