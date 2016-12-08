var portList = {},
	data = {};

px.runtime.onConnect.addListener(function(port) {
	var portName = port.name;
	
	//将port对象存放在portList变量中，以防被gc回收
	portList[portName] = port;
	console.log(portName)
	if(portName == "popup") {
		port.onMessage.addListener(function(msg) {
			switch(msg.type) {
				case "add" :
					chrome.tabs.getSelected(null,function (tab) {
						var tabURL = tab.url;

						//如果是本地文件，由于安全原因无法进行后续操作，进行消息提醒
						if(/^file:/.test(tabURL)) {
							showError("local");
							return;
						}

						//如果是和google相关的服务，也进行消息提醒			
						if(/(^https:\/\/chrome.google.com)|(^chrome:)|(^chrome\-extension:)/.test(tabURL)) {
							showError("google");
							return;
						}
						console.log(msg)
						data = msg;
						chrome.tabs.executeScript(null, {"file": "js/module/adapter.js"}, function() {
							chrome.tabs.executeScript(null, {"file": "js/content/help.js"}, function() {
								chrome.tabs.executeScript(null, {"file": "js/content/addImage.js"});
							});	
						});		
					});					
					break;
			}
		});
	}
	//页面刷新时加载上次的图片
	else if(portName === "load") {
		port.onMessage.addListener(function(msg) {
			data = msg;
			chrome.tabs.executeScript(null, {"file": "js/module/adapter.js"}, function() {
				chrome.tabs.executeScript(null, {"file": "js/content/help.js"}, function() {
					chrome.tabs.executeScript(null, {"file": "js/content/addImage.js"});
				});	
			});	
		});		
	}
	else if(portName == "content") {
		port.postMessage(data);
	}
	

	port.onDisconnect.addListener(function(port) {
		delete portList[port.name];
	});
});