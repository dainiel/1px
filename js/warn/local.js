(function(win, doc) {
	var containers = document.querySelectorAll(".container"),
		hideContainer,
		lang = navigator.language;
	//如果是中文，显示之
	if(lang === "zh-CN") {
		hideContainer = document.querySelector(".container:not(:lang(zh-cn))");		
	}
	else {
		hideContainer = document.querySelector(".container:lang(zh-cn)");
	}

	hideContainer.style.display = "none";
})(window, document);