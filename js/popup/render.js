define(function(require, exports, module) {
	var $ = require("base"),
		template = $("#showItemTemplate").html();

	function render(options) {
		var $showItem = $(template),
			$img = $showItem.find(".pics");

		var url = options.url;

		$showItem.attr({"data-imgid" : options.imgId});

		$img.attr({			
			title : options.name					
		}).css({
			backgroundImage : "url(" + url + ")"			
		});

		return $showItem;
	}

	module.exports = render;
});