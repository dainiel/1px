(function(win) {
	if(typeof define === "function") {
		define(function(require, exports, module) {
			return showError;
		});
	}
	else {
		window.showError = showError;
	}

	//显示错误消息
	function showError(msg, options) {
		var noticication,
			trans = chrome.i18n;
		
		switch(msg) {
			//文件不支持
			case("fileUnsupport") :
				noticication = webkitNotifications.createNotification("../images/logo/48.png", trans.getMessage("errorFileUnsupport1") + options.fileName, trans.getMessage("errorFileUnsupport2"));
				noticication.show();
				setTimeout(function() {
					noticication.close();
				},5000);
				break;
			//本地文件
			case("local") : 
				//alert("由于Chrome对扩展的安全限制，无法操作本地硬盘中的文件");
				/*noticication = webkitNotifications.createHTMLNotification("warn/local.html");
				noticication.show();
				setTimeout(function() {
					noticication.close();
				},5000);*/
				chrome.tabs.create({
					url : chrome.extension.getURL("app/warn/local.html")
				});
				break;
			//google
			case("google") :
				//alert("由于Chrome对扩展的安全限制，无法操作某些goolge页面");
				noticication = webkitNotifications.createNotification("../images/logo/48.png", trans.getMessage("errorGoogle1"), trans.getMessage("errorGoogle2"));
				noticication.show();
				setTimeout(function() {
					noticication.close();
				},3000);
				break;
		}
	}
})(window);