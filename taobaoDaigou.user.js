// ==UserScript==
// @name         taobaoDaigou
// @version      0.1.9
// @description  淘宝代购,保留一切版权。
// @author       Wanghsinche 
// @include      http://www.amazon.*
// @include      http://daigou.taobao.com
// @grant       GM_xmlhttpRequest
// @grant       GM_openInTab
// @grant       GM_getValue
// @grant       GM_setValue
// @grant		GM_addStyle
// @run-at document-end

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
var getTokenEvent=new Event(document);
var subStepEvent=new Event(document);
var a=null;
var b=null;
getTokenEvent.attach(function (sender,token) {
	a=null;
	b=null;
	step1(token);
	step2(token);
})
subStepEvent.attach(function (sender,agr) {
	if (agr.step==='1') {
		a=afterLoaded(agr.response);
	}
	if (agr.step==='2') {
		b=afterLoaded(agr.response);
	}
	if(a===null||b===null){
		return;
	}else{
		switch(a*b){
			case 0:
			shouMessage('已经提交');
			break;
			case 4:
			shouMessage('<a href="'+agr.response.finalUrl+'">可以提交</a>');
			break;
			default:
			shouMessage('商品已经存在');
			break;
		}
	}	
})
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
				shouMessage('get token failed');
			} else{
				getTokenEvent.notify(matchArray[1]);
			}
		},
		onerror:function(response){
				shouMessage('未知错误');
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
			return null;
		}else{
			//已知类型
			if (response.responseText.match(hasPostedParttern)===null) {
				// shouMessage('可以提交');
				return 2;
				// GM_openInTab(response.finalUrl,true);
			}else{
				//已经提交
				// shouMessage('已经提交');
				return 0;
			}
		}
	}
	else{
		//商品存在
		// shouMessage(existParttern);
		return 1;
	}

};
//////////////////////////////////
var getURL_1=function(){
	var url=location.href;
	var host=location.host;//url.match(/http:\/\/[\w|\.]*/);
	var code=url.match(/B00\w{7}/);
	var suburl='';
	suburl='http://'+host+'/dp/'+code;
	return suburl;
};
var getURL_2=function(){
	var url=location.href;
	var host=location.host;//url.match(/http:\/\/[\w|\.]*/);
	var code=url.match(/B00\w{7}/);
	var suburl='';
	suburl='http://'+host+'/gp/product/'+code;
	return suburl;
};
//////////////////////////////////
var step1=function(token){
	var loginURL='http://daigou.taobao.com/buyer/index.htm';
	var text=["action="+encodeURIComponent('/buyer/submit_url_action'),"event_submit_do_submit_url="+encodeURIComponent('anything'),"_tb_token_="+encodeURIComponent(token),"itemUrl="+encodeURIComponent(getURL_1())];
	var senddata=text.join('&');
	GM_xmlhttpRequest({
		method:"POST",
		url:loginURL,
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data:senddata,
		onload:function(response){
			subStepEvent.notify({'step':'1','response':response});
		},
		onerror:function(response){
				// globalFetchDoneEvent.notify();//skip and next account
				// console.log("username :" + tempuser+'login failed');
				// return false;
				shouMessage('未知错误');
		}
	});	
};

////////////////////
//////////////////////////////////
var step2=function(token){
	var loginURL='http://daigou.taobao.com/buyer/index.htm';
	var text=["action="+encodeURIComponent('/buyer/submit_url_action'),"event_submit_do_submit_url="+encodeURIComponent('anything'),"_tb_token_="+encodeURIComponent(token),"itemUrl="+encodeURIComponent(getURL_2())];
	var senddata=text.join('&');
	GM_xmlhttpRequest({
		method:"POST",
		url:loginURL,
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data:senddata,
		onload:function(response){
			subStepEvent.notify({'step':'2','response':response});
		},
		onerror:function(response){
				// globalFetchDoneEvent.notify();//skip and next account
				// console.log("username :" + tempuser+'login failed');
				// return false;
				shouMessage('未知错误');
		}
	});	
};

////////////////////
///////////////////
var shouMessage=function (message) {
	var spanEle=document.getElementById("wxzSpan");
	spanEle.innerHTML=message;
	spanEle.style.display='inline';
}
var titleEle=document.getElementById("productTitle");
titleEle.innerHTML=titleEle.innerHTML+'<span id="wxzSpan"  class=""></span><div class="onoffswitch"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" ><label class="onoffswitch-label" for="myonoffswitch"></label></div>';

GM_addStyle('\
	#wxzSpan{\
	display:none;\
	color:white;\
	background-color:grey;\
	border-radius:5px;\
	border:2px solid #c3c3c3;\
}\
.onoffswitch {\
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



var checkedUpdate=function (flag) {	
	if(flag===true){
		document.getElementById("myonoffswitch").checked=true;	
		getToken();	
	}else{
		document.getElementById("myonoffswitch").checked=false;			
	}
}
if (GM_getValue('daigou-open')===undefined) {
	GM_setValue('daigou-open',false);
}
checkedUpdate(GM_getValue('daigou-open'));
document.getElementById("myonoffswitch").addEventListener('change',function(){
	GM_setValue('daigou-open',this.checked);
	checkedUpdate(this.checked);
});
