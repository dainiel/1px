/* 注册清除缓存 */
seajs.use(["base", "i18n"], function($, i18n) {
	var $clear = $("#clear"),
		$disableBtn = $clear.next();
	
	$clear.on("click", function(e) {
		$disableBtn.show();
		$clear.hide();

		chrome.storage.local.clear(function() {
			var msg = chrome.i18n.getMessage("optionClearedBtn");
			$disableBtn.text(msg);
			setTimeout(function() {
				$disableBtn.hide();
				$clear.show();
			}, 2000);
		});
	});
});

//i18n针对不同语言的翻译
seajs.use(["i18n"], function(i18n) {
	//首先遍历所有“可翻译”的节点
	i18n(document.body);

	//然后监听以后插入的节点
	document.addEventListener("DOMNodeInserted", function(e) {
		var target = e.target;
		if(target.nodeType == 1) {
			i18n(target);
		}
	}, false);
});