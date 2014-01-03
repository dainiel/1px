(function(win) {
	var px = {};
	//如果支持amd则用之
	if(typeof define === "function") {
		define(function(require, exports, module) {
			return module.exports = px;
		});
	}
	else {
		px = win.px?win.px:(win.px = {});
	}	

	px.runtime = {
		connect : chrome.extension.connect,
		onConnect : chrome.extension.onConnect,
		getURL : chrome.extension.getURL
	}

	if(chrome) {
		//判断runtime接口是否存在
		if(chrome.runtime) {
			//如果支持借口，就直接用新的
			if(chrome.runtime.connect) {
				px.runtime.connect = chrome.runtime.connect;
				px.runtime.onConnect = chrome.runtime.onConnect;
				px.runtime.getURL = chrome.runtime.getURL;
			}
		}
	}
})(window);