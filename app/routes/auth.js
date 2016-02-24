var User = require('../models/user');

exports.signUp = function (req, res) {
    User.findOne({name: req.body.name}, function (err, user) {
        if (err)
            res.send(err);

        if (user) {
            res.json({state: 'fail', message: 'Name: ' + req.body.name + ' already taken'});
        } else {
            user = new User();
            user.name = req.body.name;
            user.nickname = req.body.nickname;
            user.password = user.encryptPassword(req.body.password);
            user.token = user.generateToken();
            user.location = req.body.location;
            user.save();

            res.json({state: 'success', token: user.token});
        }
    });
};

exports.signIn = function (req, res) {
    User.findOne({name: req.body.name}, function (err, user) {
        if (err)
            res.send(err);

        if (user && user.checkPassword(req.body.password)) {
            user.token = user.generateToken();
            user.save();
            res.json({state: 'success', token: user.token});
        } else {
            res.json({state: 'fail', message: 'Incorrect name or password'});
        }
    });
};