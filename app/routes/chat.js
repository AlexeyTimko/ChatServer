var Message = require('../models/message'),
    common = require('../common');

exports.addMessage = function (store, data) {
    var socket = this;
    var user = store.state.users[socket.id].user;
    var message = new Message();
    message.user = user.nickname || user.name;
    message.userId = user._id;
    message.text = data.message;
    message.location = store.state.users[socket.id].location;
    message.date = new Date();
    message.save(function (err) {
        if (err) {
            socket.emit('chat error', {message: 'SERVER_ERROR'});
        }

        common.updateChat(store, socket);
    });
};