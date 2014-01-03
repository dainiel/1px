//将图片插入到页面
function insertImage(msg, options) {
	//样式表
	var styles = '<link rel="stylesheet" type="text/css" href="'+ px.runtime.getURL("css/addImage.css") +'">';
	
	var _body = document.body,
		_wrapper = createElement({
			tagName : "div",
			attrs : {
				className : "onepx-wrapper",
				innerHTML : styles
			}
		}),
		/* 图片容器 */
		_imgBox = createElement({
			tagName : "div",
			attrs : {
				className : "onepx-picbox"				
			},
			//如果有pos，则初始化之
			style : msg.pos?msg.pos:false
		}),
		/* 各种操作 */
		_operationBox = createElement({
			tagName : "div",
			attrs : {
				className : "onepx-opertion",
				innerHTML : '<div class="onepx-btns"><button class="close pxBtn">×</button></div><div class="onepx-extra"><div class="onepx-less-box"><div class="btn-box"><button class="pxBtn more">↓</button></div></div><div class="onepx-more-box"><div class="btn-box"><button class="pxBtn less">↑</button></div><div class="nav"><span id="moveTop" class="top arrow"></span><span id="moveBottom" class="bottom arrow"></span><span id="moveLeft" class="left arrow"></span><span id="moveRight" class="right arrow"></span></div><div class="opacity-box"><input class="opacity" type="range" min="0" max="100"/></div></div></div>'
			}
		}),
		/* 图片 */
		_img = createElement({
			tagName : "img",
			attrs : {
				className : "onepx-inserted-pic",
				draggable : false,
				src : msg.src
			}
		});

	//各种操作注册
	/* 注册删除按钮事件 */		
	_operationBox.addEventListener("click", function(e) {
		//将图片从本地session中移除
		removeImgFromSession(msg.imgId);

		if(e.target.className.search("close") != -1) {
			_body.removeChild(_wrapper);
		}
	}, false);

	/* 注册拖放事件 */
	drag(_imgBox, msg.imgId);

	/* 1px工具箱 */
	nav({
		nav : _operationBox.querySelector(".nav"),
		parent : _imgBox
	});

	opacity({
		bar : _operationBox.querySelector(".opacity"),
		pic : _img
	});

	showHide({
		more : _operationBox.querySelector(".onepx-more-box"),
		less : _operationBox.querySelector(".onepx-less-box")
	});
	
	appendChilds({
		parent : _imgBox,
		children : [_img, _operationBox]
	});
	appendChilds({
		parent : _wrapper,
		children : [_imgBox]
	});
	appendChilds({
		parent : _body,
		children : [_wrapper]
	});

	//如果需要pinned到页面，则将其存储到页面
	if(options) {
		if(options.pinned) {
			addImgToSession(msg);
		}
	}
}

//获得当前session中存储图片的key
function getSessionKey() {
	var key = btoa("1px" + location.host + location.pathname);
	return key;
}

//添加图片到session
function addImgToSession(msg) {
	var key = getSessionKey();
	var imgArray = sessionStorage[key]?JSON.parse(sessionStorage[key]):{};
	imgArray[msg.imgId] = {src: msg.src};
	sessionStorage[key] = JSON.stringify(imgArray);
}

//图片移动的时候，改变其存储状态
function updateImgFromSession(imgId, pos) {
	var key = getSessionKey();
	var imgArray = sessionStorage[key]?JSON.parse(sessionStorage[key]):{};

	if(imgArray[imgId]) {
		imgArray[imgId]["pos"] = pos;
		sessionStorage[key] = JSON.stringify(imgArray);
	}	
}

//将图片从session中移除
function removeImgFromSession(imgId) {
	var key = getSessionKey();
	var imgArray = sessionStorage[key]?JSON.parse(sessionStorage[key]):{};

	if(imgArray[imgId]) {
		delete imgArray[imgId];
		sessionStorage[key] = JSON.stringify(imgArray);
	}	
}

//创建元素
function createElement(options) {
	var ele = document.createElement(options.tagName),
		attrs = options.attrs,
		style = options.style;
	
	//将style属性注入ele元素中
	if(style) {
		var styleString = "";
		for(var i in style) {
			ele.style[i] = style[i];
		}
	}

	//注入attribute
	if(attrs) {
		for(var i in attrs) {
			ele[i] = attrs[i];
		}
	}

	return ele;
}

//将子元素插入到父元素
function appendChilds(options) {
	var _parent = options.parent,
		_children = options.children,
		_fragment = document.createDocumentFragment();

	for(var i = 0,l = _children.length; i<l; i++) {
		_fragment.appendChild(_children[i]);
	}

	_parent.appendChild(_fragment);
}

//将元素变为可拖动
function drag(ele, imgId) {
	var body = document,
		left = parseInt(ele.style.left)||0,top = parseInt(ele.style.top)||0,
		startX,startY,
		endX,endY;

	//ele.style.position = "relative";
	ele.className += " onepxDraggable";

	ele.addEventListener("mousedown", function(e) {				
		startX = e.clientX;
		startY = e.clientY;			
		body.addEventListener("mousemove", move, false);
	}, false);

	body.addEventListener("mouseup", function(e) {
		body.removeEventListener("mousemove", move, false);
		//更新session中图片的位置
		updateImgFromSession(imgId, {left: left + "px", top: top + "px"});
	}, false);

	function move(e) {
		move.last = setTimeout(function() {
			clearTimeout(move.last);
			endX = e.clientX;
			endY = e.clientY;
			left = left + endX - startX;
			top = top + endY - startY;
			//更新初始xy值
			startX = endX;
			startY = endY;

			ele.style.left = left + "px";
			ele.style.top = top + "px";
		}, 0);		
	}
}

//调整窗口的显示
function showHide(options) {
	var more = options.more,
		less = options.less;

	/* moreBox中有收缩的按钮 */
	more.addEventListener("click", function(e) {
		var target = e.target;
		if(target.className.search("less") != -1) {;
			less.style.display = "block";
			more.style.display = "none";
		}
	}, false);
	
	less.addEventListener("click", function(e) {
		var target = e.target;
		if(target.className.search("more") != -1) {
			more.style.display = "block";
			less.style.display = "none";					
		}
	}, false);	
}

//以px为单位微调
function nav(options) {
	var nav = options.nav,
		parent = options.parent;		

	//注册各个按钮事件
	nav.addEventListener("click", function(e) {
		var target = e.target,
			_id = target.getAttribute("id"),
			_class = target.getAttribute("class");
		//默认最小的初始移动值是1
		var unit = 1;				

		//如果按了shift键，移动距离*10
		if(e.shiftKey) {
			var unit = unit*10;			
		}
		
		//如果是导航按钮,则进行移位操作
		if(_class.search("arrow") != -1) {
			switch(_id) {
				case("moveTop") :
					moveInPx("top", -unit);
					break;
				case("moveBottom") :
					moveInPx("top", unit);
					break;
				case("moveLeft") :
					moveInPx("left", -unit);
					break;
				case("moveRight") :
					moveInPx("left", unit);
					break;						
			}
		}
	}, false);

	//以1px为单位移动
	function moveInPx(pos, num) {
		var style = parent.style;

		var left = parseFloat(style.left),
			top = parseFloat(style.top);
		
		if(pos == "left") {
			style.left = left + num + "px";
		}
		else if(pos == "top") {
			style.top = top + num + "px";
		}
	}
}

//调整透明度
function opacity(options) {
	var bar = options.bar,
		pic = options.pic;

	var range = bar.max - bar.min;

	//防止移动透明栏的时候整个图片都移动起来
	bar.addEventListener("mousedown", function(e) {
		e.stopPropagation();
	});		

	bar.addEventListener("change", function(e) {
		var target = e.target,
			val = target.value;

		pic.style.opacity = val/range;
	}, false);
}