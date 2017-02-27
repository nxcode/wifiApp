var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec');

var monitorExport = {};

monitorExport.showStats = function(successCallback, failureCallback) {
	cordova.exec( successCallback, failureCallback, 'Traffic', 'showStats');
};

module.exports = monitorExport;

