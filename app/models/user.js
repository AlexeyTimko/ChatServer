var mongoose     = require('mongoose');
var crypto       = require('crypto');
var SHA256       = require('crypto-js').SHA256;
var Schema       = mongoose.Schema;

var UserSchema = new Schema({
    name: {type:String,required:true},
    nickname: {type:String},
    password: {type:String,required:true},
    token: {type:String,required:true},
    location: {type:String}
});

UserSchema.methods.encryptPassword = function(password){
    return SHA256(password);
};

UserSchema.methods.checkPassword = function(password){
    return SHA256(password).toString() === this.password;
};

UserSchema.methods.generateToken = function(){
    return crypto.randomBytes(32).toString('base64');
};

module.exports = mongoose.model('User', UserSchema);