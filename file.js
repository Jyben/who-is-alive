const objectToFile = require('object-to-file');

var alive = new objectToFile.default('alive');
var ad = new objectToFile.default('ad');

let File = function () { };

File.prototype.saveAlive = function (object) {
    alive.push('Alive', object);
}

File.prototype.readAlive = function () {
    return alive.read('Alive');
}
File.prototype.saveAd = function (object) {
    ad.push('Ad', object);
}

File.prototype.readAd = function () {
    return ad.read('Ad');
}

module.exports = File;