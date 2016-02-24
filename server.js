var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/chatdb');

var User = require('./app/models/user'),
    Message = require('./app/models/message');

server.listen(port, function () {
    console.log('Express server listening on port ' + port);
});
io.set('transports', ['websocket']);
var users = {};
io.on('connection', function (socket) {
    socket.on('sign up', function (data) {
        User.findOne({name: data.name}, function (err, user) {
            if (err) {
                socket.emit('sign up error', {state: 'fail', message: 'SERVER_ERROR'});
            }

            if (user) {
                socket.emit('sign up error', {state: 'fail', message: 'NAME_ALREADY_TAKEN'});
            } else {
                user = new User();
                user.name = data.name;
                user.nickname = data.nickname;
                user.password = user.encryptPassword(data.password);
                user.token = user.generateToken();
                user.location = data.location;
                user.save();
                users[socket.id] = user;
                socket.emit('sign up success', {state: 'success', token: user.token});
                updateChat(io, socket, true);
            }
        });
    });
    socket.on('sign in', function (data) {
        var where, byToken = false;
        if (data.token !== undefined) {
            byToken = true;
            where = {token: data.token};
        } else {
            where = {name: data.name}
        }

        User.findOne(where, function (err, user) {
            if (err) {
                socket.emit('sign in error', {state: 'fail', message: 'SERVER_ERROR'});
            }
            if (user && byToken) {
                users[socket.id] = user;
                updateChat(io, socket, true);
            } else if (user && user.checkPassword(data.password)) {
                user.token = user.generateToken();
                user.save();
                users[socket.id] = user;
                socket.emit('sign in success', {state: 'success', token: user.token});
                updateChat(io, socket, true);
            } else {
                socket.emit('sign in error', {state: 'fail', message: 'INVALID_CREDENTIALS'});
            }
        });
    });
    socket.on('add message', function (data) {
        var user = users[socket.id];
        var message = new Message();
        message.user = user.nickname || user.name;
        message.text = data.message;
        message.location = user.location;
        message.date = new Date();
        message.save(function (err) {
            if (err) {
                socket.emit('chat error', {state: 'fail', message: 'SERVER_ERROR'});
            }

            updateChat(io, socket);
        });
    });
});
function updateChat(io, socket, single) {
    if (single === undefined) {
        single = false;
    }
    var user = users[socket.id];
    Message.find({location: user.location}, function (err, messages) {
        if (err) {
            socket.emit('chat error', {state: 'fail', message: 'SERVER_ERROR'});
        }
        var obj = single ? socket : io;
        obj.emit('chat update', {state: 'success', items: messages});
    });
}