//isMobile为true时，要适配手机调试模式
var isMobile = !(navigator.userAgent.search("Mobile") == -1);

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
				innerHTML : '<div class="onepx-btns"><button class="close pxBtn">×</button></div><div class="onepx-extra"><div class="onepx-less-box"><div class="btn-box"><button class="pxBtn more">↓</button></div></div><div class="onepx-more-box"><div class="btn-box"><button class="pxBtn less">↑</button></div><div class="nav"><span id="moveTop" class="top arrow"></span><span id="moveBottom" class="bottom arrow"></span><span id="moveLeft" class="left arrow"></span><span id="moveRight" class="right arrow"></span></div><div class="opacity-box"><input class="opacity" type="range" min="0" max="100"/></div><div class="scale-box"><span class="scale"></span><span class="scale"></span><span class="scale"></span><span class="rate"></span></div></div></div>'
			}
		}),
		/* 图片 */
		_img = createElement({
			tagName : "img",
			attrs : {
				className : "onepx-inserted-pic",
				draggable : false,
				src : msg.src,
				//style: msg.scale?"scale(" + msg.scale + "," + msg.scale + ")":""
			}
		});
	
	//各种操作注册
	/* 注册删除按钮事件 */		
	_operationBox.addEventListener("click", function(e) {
		if(e.target.className.search("close") != -1) {
			_body.removeChild(_wrapper);
			//将图片从本地session中移除
			removeImgFromSession(msg.imgId);
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

	/* 缩放 */
	scale({
		imgId: msg.imgId,
		btn : _operationBox.querySelector(".scale-box"),
		pic : _img,
		parent : _imgBox,		
		scale: msg.scale
	});

	showHide({
		imgId: msg.imgId,
		showBtn: msg.showBtn,
		_operationBox: _operationBox,
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
function updateImgFromSession(imgId, options) {
	var key = getSessionKey();
	var imgArray = sessionStorage[key]?JSON.parse(sessionStorage[key]):{};

	if(imgArray[imgId]) {
		options.pos&&(imgArray[imgId]["pos"] = options.pos);
		options.scale&&(imgArray[imgId]["scale"] = options.scale);
		options.showBtn&&(imgArray[imgId]["showBtn"] = options.showBtn);

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
		curTranslate = /translate\((-?\d+)px\s*,\s*(-?\d+)px\)/.exec(ele.style.transform),
		left = curTranslate&&curTranslate[1]*1||0,top = curTranslate&&curTranslate[2]*1||0,
		startX,startY,
		endX,endY;
	
	//ele.style.position = "relative";	

	if(isMobile) {
		ele.addEventListener("touchstart", function(e) {
			var curTouch = e["touches"][0];

			startX = curTouch.clientX;
			startY = curTouch.clientY;			
			ele.className += " onepxDraggable";

			body.addEventListener("touchmove", touchMove, false);
		}, false);

		/*ele.addEventListener("touchmove", function(e) {		
			e.preventDefault();
			move(e["touches"][0]);
		}, false);*/

		body.addEventListener("touchend", function(e) {		
			body.removeEventListener("touchmove", touchMove, false);
			
			ele.className = ele.className.replace("onepxDraggable", "");
			//更新session中图片的位置
			//updateImgFromSession(imgId, {pos: {left: left + "px", top: top + "px"}});
			updateImgFromSession(imgId, {pos: {transform: "translate(" + left + "px," + top + "px)"}});
		}, false);
	} else {
		ele.addEventListener("mousedown", function(e) {				
			startX = e.clientX;
			startY = e.clientY;			
			ele.className += " onepxDraggable";

			body.addEventListener("mousemove", move, false);
		}, false);

		body.addEventListener("mouseup", function(e) {
			body.removeEventListener("mousemove", move, false);
			
			ele.className = ele.className.replace("onepxDraggable", "");
			//更新session中图片的位置
			//updateImgFromSession(imgId, {pos: {left: left + "px", top: top + "px"}});
			updateImgFromSession(imgId, {pos: {transform: "translate(" + left + "px," + top + "px)"}});
		}, false);
	}

	function touchMove(e) {
		e.preventDefault();
		move(e["touches"][0]);
	}

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

			//ele.style.left = left + "px";
			//ele.style.top = top + "px";

			ele.style.transform = "translate(" + left + "px," + top + "px)";
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
			showLess();

			//更新session中默认操作区展开状态
			updateImgFromSession(options.imgId, {showBtn: "less"});
		}
	}, false);
	
	less.addEventListener("click", function(e) {
		var target = e.target;
		if(target.className.search("more") != -1) {
			showMore();	

			//更新session中默认操作区展开状态
			updateImgFromSession(options.imgId, {showBtn: "more"});
		}
	}, false);	

	if(options.showBtn == "less") {
		showLess();
	} else if(options.showBtn == "more") {
		showMore();	
	}

	//缩回
	function showLess() {
		less.style.display = "block";
		more.style.display = "none";
	}

	//放下
	function showMore() {
		more.style.display = "block";
		less.style.display = "none";			
			
		requestAnimationFrame(function() {
			var scaleBox = options._operationBox.querySelector(".scale-box");
			scaleBox.style.bottom = 0;	
		})	
	}
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

		/*var left = parseFloat(style.left),
			top = parseFloat(style.top);*/
		var curTranslate = /translate\((-?\d+)px\s*,\s*(-?\d+)px\)/.exec(style.transform),
			left = curTranslate&&curTranslate[1]*1||0,
			top = curTranslate&&curTranslate[2]*1||0;
		
		if(pos == "left") {
			left += num;
		}
		else if(pos == "top") {
			top += num;
		}

		style.transform = "translate(" + left + "px," + top + "px)";
	}
}

//调整透明度
function opacity(options) {
	var bar = options.bar,
		pic = options.pic;

	var range = bar.max - bar.min;

	//防止移动透明栏的时候整个图片都移动起来
	if(isMobile) {		
		bar.addEventListener("touchmove", function(e) {
			e.stopPropagation();
		});	
	} else {
		bar.addEventListener("mousedown", function(e) {
			e.stopPropagation();
		});	
	}		

	bar.addEventListener("change", function(e) {
		var target = e.target,
			val = target.value;

		pic.style.opacity = val/range;
	}, false);
}

//调整尺寸
function scale(options) {
	var btn = options.btn,
		pic = options.pic,
		rateTxt = btn.querySelector(".rate"),
		_parent = options.parent;
	var body = document,
		picWidth = pic.naturalWidth,
		picHeight = pic.naturalHeight,
		startX, startY,
		endX,endY;
	var rate = options.scale||1;

	//初始化尺寸
	/*if(picWidth > document.documentElement.clientWidth) {
		picHeight = picHeight*document.documentElement.clientWidth/picWidth;
		picWidth = document.documentElement.clientWidt;
	}*/
	setSize(rate);

	if(isMobile) {
		btn.addEventListener("touchstart", function(e) {
			e.stopPropagation();
			e.preventDefault()

			var curTouch = e["touches"][0];
			startX = curTouch.clientX;
			startY = curTouch.clientY;			

			body.addEventListener("touchmove", touchScale, false);

			_parent.className += " onepxScalable";
		});	

		/*btn.addEventListener("touchmove", function(e) {
			e.stopPropagation();
			e.preventDefault()

			var curTouch = e["touches"][0];
			scale(curTouch);			
		});	*/

		btn.addEventListener("touchend", function(e) {
			body.removeEventListener("touchmove", touchScale, false);
			console.log(23423432)
			_parent.className = _parent.className.replace("onepxScalable", "");
			
			//更新session中图片的位置
			updateImgFromSession(options.imgId, {scale: rate});		
		});	
	} else {
		btn.addEventListener("mousedown", function(e) {
			e.stopPropagation();
			e.preventDefault()

			startX = e.clientX;
			startY = e.clientY;			
			body.addEventListener("mousemove", scale, false);

			_parent.className += " onepxScalable";
		});	

		body.addEventListener("mouseup", function(e) {
			body.removeEventListener("mousemove", scale, false);

			_parent.className = _parent.className.replace("onepxScalable", "");

			//更新session中图片的位置
			updateImgFromSession(options.imgId, {scale: rate});
		});	
	}

	function touchScale(e) {
		e.stopPropagation();
		e.preventDefault();
		scale(e["touches"][0]);
	}

	function scale(e) {
		scale.last = setTimeout(function() {
			clearTimeout(scale.last);
			endX = e.clientX;
			endY = e.clientY;
			var xRate = (endX - startX)/picWidth,
				yRate = (endY - startY)/picHeight;

			if(xRate >=0&& yRate >=0) {
				rate += Math.min(xRate, yRate);
			} else if(xRate <=0&& yRate <=0){
				rate += Math.max(xRate, yRate);
			} else {
				return;
			}

			//更新初始xy值
			startX = endX;
			startY = endY;

			setSize(rate);

			//pic.style.transform = "scale(" + rate + "," + rate + ")";
		}, 0);	
	}

	//设置图片尺寸
	function setSize(rate) {
		pic.style.width = picWidth*rate + "px";
		pic.style.height = picHeight*rate + "px";

		var showRate = parseInt(rate*100);		

		if(showRate%100) {
			if(showRate%10) {
				showRate = showRate/100;
			} else {
				showRate = showRate/100 + "0";
			}
		} else {
			showRate = showRate/100 + ".00";
		}

		rateTxt.innerText = showRate;
	}
}