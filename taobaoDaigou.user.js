// ==UserScript==
// @name         taobaoDaigou
// @version      0.1.8
// @description  淘宝代购,保留一切版权。
// @author       Wanghsinche 
// @include      http://www.amazon.co.uk/*
// @include      http://www.amazon.co.jp/*
// @include      http://www.amazon.com/*
// @include      http://daigou.taobao.com
// @grant       GM_xmlhttpRequest
// @grant       GM_openInTab
// @grant       GM_getValue
// @grant       GM_setValue
// @grant		GM_addStyle
// @run-at document-body

// ==/UserScript==
//Event is a simple class for implementing the Observer pattern:
function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach : function (listener) {//push the callback function into _listeners[];
        this._listeners.push(listener);
    },
    notify : function (args) {//pop all the callback functions and execute the functions with same args?
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);//auto pass sender and args into callback function, so the default form of callback function is function(sender,args){}
        }
    }
};
//////////////////////////////////
var getToken=function () {
	GM_xmlhttpRequest({
		method:"GET",
		url:"http://daigou.taobao.com/buyer/index.htm",
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'text/html'
		},
		onload:function(response){
			var matchArray=response.responseText.match(/data-token="(\w*)"/);
			if (matchArray===null||matchArray.length<2) {
				alert('get token failed');
			} else{
				var suburl=getURL();
				fetchLogin(matchArray[1],suburl);
			}
		},
		onerror:function(response){
				alert('未知错误');
		}
	});		
};
//////////////////////////////////
//////////////////////////////////
var afterLoaded=function(response){
	var existParttern="商品已经存在";
	var successParttern="itemPublish.htm";
	var hasPostedParttern="已经存在该商品";
	var decodedUrl=decodeURIComponent(response.finalUrl);
	if (decodedUrl.match(existParttern)===null) {
		//商品不存在，继续
		if (decodedUrl.match(successParttern)===null){
			//未知类型，退出
			alert(decodedUrl);
		}else{
			//已知类型
			if (response.responseText.match(hasPostedParttern)===null) {
				shouMessage('可以提交');
				// GM_openInTab(response.finalUrl,true);
			}else{
				//已经提交
				shouMessage('已经提交');
			}
		}
	}
	else{
		//商品存在
		shouMessage(existParttern);
	}

};
//////////////////////////////////
var getURL=function(){
	var url=location.href;
	var host=location.host;//url.match(/http:\/\/[\w|\.]*/);
	var code=url.match(/B00\w{7}/);
	var suburl='';
	suburl='http://'+host+'/dp/'+code;
	return suburl;
};
//////////////////////////////////
var fetchLogin=function(token,suburl){
	var loginEvent= new Event(this);
	var loginURL='http://daigou.taobao.com/buyer/index.htm';
	var text=["action="+encodeURIComponent('/buyer/submit_url_action'),"event_submit_do_submit_url="+encodeURIComponent('anything'),"_tb_token_="+encodeURIComponent(token),"itemUrl="+encodeURIComponent(suburl)];
	var senddata=text.join('&');
	var _this=this;
	console.log(suburl);
	GM_xmlhttpRequest({
		method:"POST",
		url:loginURL,
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data:senddata,
		onload:function(response){
			afterLoaded(response);
		},
		onerror:function(response){
				// globalFetchDoneEvent.notify();//skip and next account
				// console.log("username :" + tempuser+'login failed');
				// return false;
				alert('未知错误');
		}
	});	
};

////////////////////
///////////////////
var shouMessage=function (message) {
	var spanEle=document.getElementById("wxzSpan");
	spanEle.innerHTML=message;
}
var titleEle=document.getElementById("productTitle");
titleEle.innerHTML=titleEle.innerHTML+'<span id="wxzSpan" style="color:blue" class=""></span><div class="onoffswitch"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" ><label class="onoffswitch-label" for="myonoffswitch"></label></div>';

GM_addStyle('.onoffswitch {\
    position: relative; width: 51px;\
    -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;\
}\
.onoffswitch-checkbox {\
    display: none;\
}\
.onoffswitch-label {\
    display: block; overflow: hidden; cursor: pointer;\
    height: 24px; padding: 0; line-height: 24px;\
    border: 2px solid #CCCCCC; border-radius: 24px;\
    background-color: #FFFFFF;\
    transition: background-color 0.3s ease-in;\
}\
.onoffswitch-label:before {\
    content: "";\
    display: block; width: 24px; margin: 0px;\
    background: #FFFFFF;\
    position: absolute; top: 0; bottom: 0;\
    right: 25px;\
    border: 2px solid #CCCCCC; border-radius: 24px;\
    transition: all 0.3s ease-in 0s; \
}\
.onoffswitch-checkbox:checked + .onoffswitch-label {\
    background-color: #49E845;\
}\
.onoffswitch-checkbox:checked + .onoffswitch-label, .onoffswitch-checkbox:checked + .onoffswitch-label:before {\
   border-color: #49E845;\
}\
.onoffswitch-checkbox:checked + .onoffswitch-label:before {\
    right: 0px; \
}');

document.getElementById("myonoffswitch").addEventListener('click',function(){
	var flag=GM_getValue('daigou-open')===undefined?false:GM_getValue('daigou-open');	
	flag=!flag;
	GM_setValue('daigou-open',flag);
	checkFlag();
});

var checkFlag=function () {
	// body...
	var flag=GM_getValue('daigou-open')===undefined?false:GM_getValue('daigou-open');
	if (GM_getValue('daigou-open')===undefined) {
		GM_setValue('daigou-open',false);
		flag=false;
	}else{
		flag=GM_getValue('daigou-open');
	}	
	if(flag===true){
		document.getElementById("myonoffswitch").checked=true;	
		getToken();	
	}else{
		document.getElementById("myonoffswitch").checked=false;			
	}
}

checkFlag();
