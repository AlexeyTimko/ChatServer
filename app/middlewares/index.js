exports.routeMiddleware = function () {
    var args = arguments;
    return function (func) {
        return func.bind(args[0], args[1]);
    }
};