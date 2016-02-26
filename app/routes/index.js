var auth = require('./auth'),
    chat = require('./chat'),
    routeMiddleware = require('../middlewares/').routeMiddleware;

module.exports = function (store) {
    var io = store.state.io;
    io.set('transports', ['websocket']);
    io.on('connection', function (socket) {
        var route = routeMiddleware(socket, store);
        //auth events
        socket.on('disconnect', route(auth.disconnect));
        socket.on('set location', route(auth.setLocation));
        socket.on('sign up', route(auth.signUp));
        socket.on('sign in', route(auth.signIn));
        //chat events
        socket.on('add message', route(chat.addMessage));
    });
};
