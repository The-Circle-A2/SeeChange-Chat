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
            const verified = verifyMessage(message);
            
            if (verified) {
                const user = userJoin(socket.id, message.message.username, message.message.stream);
            
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
                let message = formatMessage(user.username, msg.message, false);
                emitMessage(user, message);
                SaveMongoDB(message, user, msg.signature, verified);
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

function SaveMongoDB(message, user, signature, verified)
{
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

  module.exports = startChatServer;
