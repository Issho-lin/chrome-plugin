var Build = {
	init:function(){
		var child, data,check;
		if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
			child = document.body.children.length ? document.body.childNodes[0] : document.body;
			data = child.innerText.trim();
			check=true;
		}else if(document.body){
			data = document.body.innerText;
			data = data.trim();
			if(/^\w+\(/.test(data) || /^[\{\[]/.test(data)){
				check=true;
			}
		}
		if(data && check){
			this.sendMessage(data);
		}
	},

	/**
	 * 发送消息
	 * @param data
     */
	sendMessage:function(data){
		chrome.runtime.sendMessage([data,window.location.href],function(result){
			if(result && result[0]){
				document.body.innerHTML=result[0];
				Build._appendCss();
				Build._appendBtns();
				Build._appendZeptojs();
				Build._appendAppjs();
				Build._appendInitMsg(result[1]);
			}
		})
	},

	_appendCss:function(result){
		var jsonViewCss= chrome.extension.getURL("static/css/json.css");
		var el = document.createElement('link');
		el.rel='stylesheet';
		el.href=jsonViewCss;
		document.head.appendChild(el);
	},

	_appendBtns:function(){
		var el = document.createElement('div');
		el.id='commentContainer';
		el.className='commentContainer';
		var str = '<a href="javascript:;" target="_blank" class="comment" id="restore">-Source</a>';
		str += ' <a href="http://tools.vkitty.org/jsonview/" target="_blank" class="comment" id="toOnline">Online</a>';
		var onlineLink =str;
		el.innerHTML = onlineLink;
		document.body.appendChild(el);
	},

	_appendZeptojs:function(){
		var el = document.createElement('script');
		el.type='text/javascript';
		el.src=chrome.extension.getURL('static/lib/zepto.min.js');
		document.head.appendChild(el);
	},

	_appendAppjs:function(){
		var el = document.createElement('script');
		el.src=chrome.extension.getURL('static/js/app.js');
		document.head.appendChild(el);
	},

	_appendInitMsg:function(msg){
		var el = document.createElement('div');
		el.id="initMsg";
		el.innerHTML = msg;
		document.body.appendChild(el);
	}

};

Build.init();