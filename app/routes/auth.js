var User = require('../models/user'),
    Message = require('../models/message'),
    _ = require('lodash'),
    common = require('../common');

exports.disconnect = function(store){
    var socket = this,
        users = store.state.users;
    if(users[socket.id] !== undefined){
        socket.leave(store.location);
        _.unset(users, socket.id);
        store.setState(users);
    }
};

exports.setLocation = function(store, data){
    store.setState({location: data.location});
};

exports.signUp = function (store, data, respond) {
    var socket = this;
    User.findOne({name: data.name}, function (err, user) {
        if (err) {
            respond({state: 'error', message: 'SERVER_ERROR'});
        }

        if (user) {
            respond({state: 'error', message: 'NAME_ALREADY_TAKEN'});
        } else {
            user = new User();
            user.name = data.name;
            user.nickname = data.nickname;
            user.password = user.encryptPassword(data.password);
            user.token = user.generateToken();
            user.save();

            var newUser = {};
            newUser[socket.id] = {user: user, socket: socket};
            store.setState({users: _.merge(store.state.users, newUser)});
            socket.join(store.location);

            respond({state: 'success', token: user.token});
            common.updateChat(store, socket, true);
        }
    });
};

exports.signIn = function (store, data, respond) {
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
            respond({state: 'error', message: 'SERVER_ERROR'});
        }
        var newUser = {};
        if (user && byToken) {

            newUser[socket.id] = {user: user, socket: socket};
            store.setState({users: _.merge(store.state.users, newUser)});
            socket.join(store.location);

            common.updateChat(store, socket, true);
        } else if (user && user.checkPassword(data.password)) {
            user.token = user.generateToken();
            user.save();

            newUser[socket.id] = {user: user, socket: socket};
            store.setState({users: _.merge(store.state.users, newUser)});
            socket.join(store.location);

            respond({state: 'success', token: user.token});
            common.updateChat(store, socket, true);
        } else {
            respond({state: 'success', message: 'INVALID_CREDENTIALS'});
        }
    });
};