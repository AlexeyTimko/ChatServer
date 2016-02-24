var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema = new Schema({
    user: String,
    text: String,
    date: Date,
    location: String
});

module.exports = mongoose.model('Message', MessageSchema);