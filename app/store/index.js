var _ = require('lodash');
function Store(){
    this.state = {};
}

Store.prototype.setState = function(newState){
    _.assign(this.state, newState);
};

module.exports = Store;