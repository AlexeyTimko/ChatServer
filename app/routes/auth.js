var User = require('../models/user'),
    Message = require('../models/message'),
    _ = require('lodash'),
    common = require('../common');

exports.disconnect = function(store){
    var socket = this,
        users = store.state.users;
    _.unset(users, socket.id);
    store.setState(users);
};

exports.signUp = function (store, data) {
    var socket = this;
    User.findOne({name: data.name}, function (err, user) {
        if (err) {
            socket.emit('sign up error', {message: 'SERVER_ERROR'});
        }

        if (user) {
            socket.emit('sign up error', {message: 'NAME_ALREADY_TAKEN'});
        } else {
            user = new User();
            user.name = data.name;
            user.nickname = data.nickname;
            user.password = user.encryptPassword(data.password);
            user.token = user.generateToken();
            user.location = data.location;
            user.save();

            var newUser = {};
            newUser[socket.id] = {user: user, socket: socket};
            store.setState({users: _.merge(store.state.users, newUser)});

            socket.emit('sign up success', {token: user.token});
            common.updateChat(store, socket, true);
        }
    });
};

exports.signIn = function (store, data) {
    var socket = this;
    var where, byToken = false;
    if (data.token !== undefined) {
        byToken = true;
        where = {token: data.token};
    } else {
        where = {name: data.name}
    }

    User.findOne(where, function (err, user) {
        if (err) {
            socket.emit('sign in error', {message: 'SERVER_ERROR'});
        }
        var newUser = {};
        if (user && byToken) {

            newUser[socket.id] = {user: user, socket: socket};
            store.setState({users: _.merge(store.state.users, newUser)});

            common.updateChat(store, socket, true);
        } else if (user && user.checkPassword(data.password)) {
            user.token = user.generateToken();
            user.save();

            newUser[socket.id] = {user: user, socket: socket};
            store.setState({users: _.merge(store.state.users, newUser)});

            socket.emit('sign in success', {token: user.token});
            common.updateChat(store, socket, true);
        } else {
            socket.emit('sign in error', {message: 'INVALID_CREDENTIALS'});
        }
    });
};