var Message = require('./models/message');

exports.updateChat = function (store, socket, single) {
    if (single === undefined) {
        single = false;
    }
    Message.find({location: store.location}, function (err, messages) {
        if (err) {
            socket.emit('chat error', {message: 'SERVER_ERROR'});
        }
        if(single) {
            socket.emit('chat update', {items: messages});
        }else{
            socket.emit('chat update', {items: messages});
            socket.to(store.location).emit('chat update', {items: messages});
        }
    });
};