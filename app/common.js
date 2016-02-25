var Message = require('./models/message');

exports.updateChat = function (store, socket, single) {
    if (single === undefined) {
        single = false;
    }
    var user = store.state.users[socket.id].user;
    Message.find({location: user.location}, function (err, messages) {
        if (err) {
            socket.emit('chat error', {message: 'SERVER_ERROR'});
        }
        if(single) {
            socket.emit('chat update', {items: messages});
        }else{
            for(var socketId in store.state.users){
                if(store.state.users[socketId].user.location == user.location){
                    store.state.users[socketId].socket.emit('chat update', {items: messages});
                }
            }
        }
    });
};