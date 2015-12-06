(function(){

function ModalView(){
	var _this = this;
	var main_html = String()
		+  '<div class="modal-view-part">'	
		+		'<span class="modal-prev-button"></span>'
		+		'<img class="modal-image" src="" alt="">'
		+		'<span class="modal-next-button"></span>'
		+	'</div>'
		+	'<div class="modal-loading"></div>'
		+	'<div class="modal-close-button"></div>';

	this.modalItemsInfoArray = Array();
	this.itemIndex = null;

	//	创建遮罩和弹出框层
	this.modalMask = $('<div id="modal-mask"></div>');
	this.modalMain = $('<div id="modal-main"></div>');

	//	初始化DOM节点
	this.bodyNode = $(document.body);
	this.modalMain.html(main_html);
	this.bodyNode.append(this.modalMask, this.modalMain);

	//	获取需要操作的元素
	this.modalViewPart = this.modalMain.find('.modal-view-part');
	this.modalImage     = this.modalMain.find('.modal-image');
	this.closeButton    = this.modalMain.find('.modal-close-button');
	this.loading   = this.modalMain.find('.modal-loading')
	this.modalNextButton = this.modalMain.find('.modal-next-button');
	this.modalPrevButton = this.modalMain.find('.modal-prev-button');
	
	//	获取页面中需要添加效果的元素
	this.getModalItems();

	//	给Mask层添加点击关闭事件
	this.modalMask.click(function(event) {
		_this.modalMain.fadeOut(300);
		$(this).fadeOut(500);
	});
	//	给关闭按钮添加点击事件
	this.closeButton.click(function(event) {
		_this.modalMain.fadeOut(300);
		_this.modalMask.fadeOut(500);
	});
	
	this.bodyNode.delegate('.modal', 'click', function(event) {
		event.stopPropagation();
		//	元素被点击后弹出遮罩层与内容层
		_this.showModal($(this).attr('data-source'));

		_this.displayButton();
	});

	//	图片切换按钮的显示逻辑
	this.modalNextButton.hover(function() {
		if(!$(this).hasClass('disabled') && _this.modalItemsInfoArray.length > 1 && _this.itemIndex != _this.modalItemsInfoArray.length - 1){
			$(this).addClass('modal-next-button-show');
		}
	}, function() {
		$(this).removeClass('modal-next-button-show');
	});

	this.modalPrevButton.hover(function() {
		if(!$(this).hasClass('disabled') && _this.itemIndex != 0 && _this.modalItemsInfoArray.length > 1){
			$(this).addClass('modal-prev-button-show');
		}
	}, function() {
		$(this).removeClass('modal-prev-button-show')
	});

	//	图片切换按钮的调用
	this.modalNextButton.click(function(event) {
		if(!$(this).hasClass('disabled')){
			_this.switchImage('next');
		}
	});
	this.modalPrevButton.click(function(event) {
		if(!$(this).hasClass('disabled')){
			_this.switchImage('prev');
		}
	});

	//	窗口调整大小后重置图片尺寸
	$(window).resize(function(event) {
		_this.setImageSize(_this.modalItemsInfoArray[_this.itemIndex].src);

	});
	
	
}
ModalView.prototype = {
	showModal : function(src){
		var _this = this;

		var windowWidth  = $(window).width();
		var windowHeight = $(window).height();

		//	用自身的src属性判断并设定当前的下标
		this.itemIndex = this.getArrayIndex(src);

		_this.modalMask.fadeIn();
		_this.modalMain.fadeIn();

		//	设定弹出框尺寸
		this.modalMain.css({
			//	图片区域有5px的border，左右加起来为10
			width: windowWidth / 2,
			height: windowHeight / 2,
			//	modalMain的宽度为屏幕的1/2，所以屏幕四分之一宽度也就是modalMain的一半,marginLeft设定为这个值就可以让modalMain居中
			marginLeft: -(windowWidth / 4),
			top: windowHeight / 2  /2
		});


		_this.setImageSize(src);
		
	},
	setImageSize : function(src){
		var _this = this;

		_this.loading.show();
		_this.closeButton.hide();
		_this.modalImage.hide();

		//	因为图片元素的尺寸是直接设置上去的，第二次会直接读取到上一张图片的尺寸，清空才能避免
		_this.modalImage.css({
				width: 'auto',
				height: 'auto'
		});

		//	取得图片的真实宽高
		this.earlyImage(src, function(){
			_this.modalImage.attr('src', src);
			_this.changeImageSize();
		});	

	},
	changeImageSize : function(){
		var _this = this;
		//	修改图片尺寸为当前页面可容纳的尺寸
		//	图片预载好了，下面可以将弹出框运动至可以容纳图片和兼容视口的尺寸
		var windowWidth  = $(window).width();
		var windowHeight = $(window).height();
		var imageWigth   = _this.modalImage.width();
		var imageHeight  = _this.modalImage.height();

		//	如果图片宽高大于浏览器的视口的宽高比，计算是否溢出
		var scale   = Math.min(windowWidth/(imageWigth + 10), windowHeight/(imageHeight + 10), 1);
		imageWigth  = imageWigth * scale / 1.1;
		imageHeight = imageHeight * scale / 1.1;


		//	放大弹出层动画执行完毕后，设置图片尺寸并将其显示
		_this.modalMain.animate({
			width      : imageWigth + 10,
			height     : imageHeight + 10,
			marginLeft : -(imageWigth / 2),
			top        : (windowHeight - imageHeight) / 2
		}, 300, function() {
			_this.modalImage.css({
				width  : imageWigth,
				height : imageHeight 
			}).fadeIn();
			_this.closeButton.show();
			_this.loading.hide();
		
		});
	},
	earlyImage : function(src, callBack){
		var image = new Image();

		if(window.ActiveXObject){
			image.onreadystatechange = function(){
				if(this.readyState == 'complete'){
					callBack();
				}
			};
		}else{
			image.onload = function(){
				callBack();
			}
		}
		image.src = src;
	},
	getModalItems : function(){
		var _this = this;
		var itemArray = Array();

		itemArray = _this.bodyNode.find('.modal');
		itemArray.each(function(index, el) {
			_this.modalItemsInfoArray.push({
				'src' : $(this).attr('data-source'),
				'alt' : $(this).attr('alt')
			});
		});
	},
	getArrayIndex : function(src){
		var index = 0;
		$(this.modalItemsInfoArray).each(function(i, el) {
			index = i;
			if(this.src === src){
				return false;
			}
		});
		return index;
	},
	switchImage : function(dir){
		var _this = this;
		if(dir === 'next'){
		 	_this.setImageSize(_this.modalItemsInfoArray[++_this.itemIndex].src);
		}else if(dir === 'prev'){
			 _this.setImageSize(_this.modalItemsInfoArray[--_this.itemIndex].src);
		}
		_this.displayButton();
	},
	displayButton : function(){
		var _this = this;
		if(_this.modalItemsInfoArray.length > 1){
			if(_this.itemIndex === 0){
				//	第一个元素的情况
				_this.modalPrevButton.addClass('disabled')
				_this.modalNextButton.removeClass('disabled')
			}else if(_this.itemIndex === (_this.modalItemsInfoArray.length - 1)){
				//	最后一个元素的情况
				_this.modalPrevButton.removeClass('disabled')
				_this.modalNextButton.addClass('disabled')
			}else{
				//	其他情况
				_this.modalPrevButton.removeClass('disabled')
				_this.modalNextButton.removeClass('disabled')
			}
		}
	}
};

new ModalView();

})();