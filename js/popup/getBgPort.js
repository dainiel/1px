define(function(require, modules, exports) {
	var bgPort = chrome.runtime.connect({name : "popup"});

	return function getBgPort() {
		return bgPort;
	}
});