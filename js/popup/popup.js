//i18n针对不同语言的翻译
seajs.use(["base", "i18n"], function($, i18n) {
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

//监听上传按钮事件
seajs.use(["base", "adapter", "msg", "popup/render"], function($, px, showError, render) {
	var uploadBtn = $("#pxFile"),
		showList = $(".show-box .show-list");
	// 模板文件
	var templates = {};

	//和background交互的port对象
	var bgPort = window.bgPort || px.runtime.connect({name : "popup"});
	window.bgPort = bgPort;

	//弹出管理页面
	$("#pxManage").on("click", function(e) {
		chrome.tabs.create({
			url: "app/manage.html"
		}, function() {

		});
	});

	//选择文件改变时，读取相关信息
	uploadBtn.on("change", function(e) {
		var files = e.target.files;

		addFilesToPage(files);		
	});

	//将文件添加到页面中
	function addFilesToPage(files) {
		var file,reader;
		for(var i = 0,l = files.length; i<l; i++) {
			file = files[i];
			//判断是不是图片
			if(!(/image/.test(file.type))) {
				showError("fileUnsupport", {fileName : file.name});
				continue;
			}

			//如果是图片，读取之
			reader = new FileReader();
			
			//图片成功读取，则渲染进popup页面中
			reader.onload = function(e) {				
				var dataURL = e.target.result,
					fileName = file.name;

				//将图片存到本地
				var imgId =saveToLocal({
					name : fileName,
					url : dataURL
				});	

				var $showItem = render({
					name : fileName,
					imgId : imgId,
					url : dataURL
				});

				//将图片插入当前页面
				postToBg();

				showList.prepend($showItem);

				//将需要的操作发送给后台
				function postToBg() {
					bgPort.postMessage({
						type : "add",
						imgId : imgId,
						src : dataURL
					});
				}
			}

			//将文件作为base64的方式读取
			reader.readAsDataURL(file);
		}
	}

	//将图片存到本地
	function saveToLocal(options) {
		var dataURL = options.url;

		var timestamp = (new Date()).getTime(),
			imgId = "img" + timestamp,
			data = {};		
		
		//需要存到本地的相关数据
		data[imgId] = {
			name : options.name,
			url : dataURL
		};
		
		chrome.storage.local.set(data);

		return imgId;
	}
});

//监听删除等按钮事件
seajs.use(["base", "adapter"], function($, px) {
	var $content = $("#pxContent"),
		$showList = $content.find(".show-list");

	//和background交互的port对象
	var bgPort = window.bgPort || px.runtime.connect({name : "popup"});
	window.bgPort = bgPort;

	//删除当前图片
	$showList.on("click", ".delete" ,function(e) {
		var $deleteBtn = $(e.target),
			$showItem = $deleteBtn.parents(".show-item");

		//将图片从本地删除
		delFromLocal({imgId : $showItem.attr("data-imgid")});

		$showItem.animate({
			opacity : 0
		}, {
			duration : 100,
			complete : function() {
				$showItem.remove();
			}
		});
	});

	//插入图片到当前页面
	$showList.on("click", ".insert", function(e) {
		var $deleteBtn = $(e.target),
			$showItem = $deleteBtn.parents(".show-item");

		var $img = $showItem.find(".pics"),
			results = /\(\"(.*)\"\)/.exec($img[0].style.backgroundImage),
			dataURL = results[1];
		
		bgPort.postMessage({
			type : "add",
			imgId : $showItem.attr("data-imgid"),
			src : dataURL
		});
	});

	//将图片从本地删除
	function delFromLocal(options) {
		var imgId = options.imgId;		
		chrome.storage.local.remove(imgId);
	}
});

//打开popup时读取之前存储的
seajs.use(["base", "popup/render"], function($, render) {
	var $showList = $(".show-list");
	
	var sync = chrome.storage.sync;

	//如果有之前存储的数据，读取之
	setTimeout(function() {
		chrome.storage.local.get(null, function(items) {
			var $item,data;

			for(var a in items) {
				//如果以img开头
				if(a.indexOf("img") == 0) {
					data = items[a];
					data.imgId = a;
					$item = render(data);
				}
				$showList.prepend($item);
			}
		});
	}, 0);
});
