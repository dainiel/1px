(function(win) {
	//如果支持amd则用之
	if(define) {
		define(function(require, exports, module) {
			return translateEles;
		});
	}
	else {
		var pxI18n = win.pxI18n?win.pxI18n:(win.pxI18n = {});
		pxI18n = translateEles;
	}	

	//找到父元素的中可以进行翻译的子元素，然后翻译之
	function translateEles(parent) {
		var eles = parent.querySelectorAll("[data-i18n]"),
			ele;

		translate(parent);
		//遍历parent的子元素
		for(var i = 0,l = eles.length; i<l; i++) {
			ele = eles[i];
			translate(ele);
		}
	}

	//翻译元素
	function translate(ele) {
		var data = ele.getAttribute("data-i18n"),
			text,title;
		
		if(data) {
			text = chrome.i18n.getMessage(data);
			if(text) {
				ele.innerHTML = text;

				//如果有标题需要翻译，做之
				if(title = chrome.i18n.getMessage(data + "Title")) {
					ele.setAttribute("title", title);
				}
			}
		}
	}
})(window);