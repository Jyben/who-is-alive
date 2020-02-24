const objectToFile = require('object-to-file');

var db = new objectToFile.default('alive');

let File = function () { };

File.prototype.save = function (object) {
    db.push('Alive', object);
}

File.prototype.read = function () {
    return db.read('Alive');
}

module.exports = File;