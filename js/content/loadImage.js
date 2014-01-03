//加载上次pin住的图片
(function() {
	var imgArray = sessionStorage[btoa("1px" + location.host + location.pathname)];

	if(imgArray) {
		var port = px.runtime.connect({name : "load"});
		//从localStorage中取出的需要转成JS对象
		imgArray = JSON.parse(imgArray);

		var imgArray2 = [];

		//将imgArray的格式转换成insertImage方法可以读懂的
		for(var id in imgArray) {
			imgArray2.push({
				imgId: id,
				src: imgArray[id].src,
				pos: imgArray[id].pos
			});
		}

		port.postMessage({
			type: "batAdd",
			imgArray: imgArray2
		});
	}
})();