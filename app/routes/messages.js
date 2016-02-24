var Message = require('../models/message');
var User = require('../models/user');

exports.getAll = function (req, res) {
    User.findOne({token: req.body.token}, function (err, user) {
        if (err)
            res.send(err);

        if (user) {
            Message.find({location: user.location}, function(err, messages) {
                if (err)
                    res.send(err);

                res.json({state: 'succes', items: messages});
            });
        } else {
            res.json({state: 'fail', message: 'User not found'});
        }
    });
};

exports.addMessage = function(req, res){
    User.findOne({token: req.body.token}, function (err, user) {
        if (err)
            res.send(err);

        if (user) {
            var message = new Message();
            message.user = user.nickname;
            message.text = req.body.text;
            message.location = user.location;
            message.date = new Date();
            message.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ state: 'success' });
            });
        } else {
            res.json({state: 'fail', message: 'User not found'});
        }
    });
};