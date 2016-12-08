(function() {
	var port = px.runtime.connect({name : "content"});

	port.onMessage.addListener(function(msg) {
		console.log(msg);
		if(msg.type == "add") {
			insertImage(msg, {pinned: true});
		}
		//批量添加图片
		else if(msg.type = "batAdd") {
			var imgArray = msg.imgArray;

			for(var i = 0, l = imgArray.length; i<l; i++) {
				insertImage(imgArray[i]);
			}
		}
	});	
})();