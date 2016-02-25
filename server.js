var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    routes = require('./app/routes/'),
    port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/chatdb');
var Store = require('./app/store/'),
    store = new Store();
var initialState = {
    io: io,
    users: {}
};
store.setState(initialState);
routes(store);

server.listen(port, function () {
    console.log('Express server listening on port ' + port);
});