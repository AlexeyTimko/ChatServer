var Message = require('./models/message');

exports.updateChat = function (store, socket, single) {
    var location = store.state.users[socket.id].location;
    if (location === undefined) {
        return;
    }
    if (single === undefined) {
        single = false;
    }
    Message.find({location: location}, function (err, messages) {
        if (err) {
            socket.emit('chat error', {message: 'SERVER_ERROR'});
        }
        socket.emit('chat update', {items: messages});
        if(!single){
            socket.to(location).emit('chat update', {items: messages});
        }
    });
};