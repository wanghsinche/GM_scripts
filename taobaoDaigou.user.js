// ==UserScript==
// @name         taobaoDaigou
// @version      0.1
// @description  淘宝代购,保留一切版权。
// @author       Wanghsinche 
// @include      http://www.amazon.co.uk/*
// @include      http://daigou.taobao.com


// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue


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
var fetchLogin=function(i){
	var loginEvent= new Event(this);	
	var loginURL='http://daigou.taobao.com/buyer/index.htm';
	var text=["action="+encodeURIComponent('/buyer/submit_url_action'),"event_submit_do_submit_url="+encodeURIComponent('anything'),"_tb_token_="+encodeURIComponent('LUHLJE8DqGtdw64'),"itemUrl="+encodeURIComponent('http://www.amazon.com/dp/B00WBK03OU')];
	var senddata=text.join('&');
	var _this=this;
	GM_xmlhttpRequest({
		method:"GET",
		url:loginURL,
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data:senddata,
		onload:function(response){
			// if (response.finalUrl==="http://buyers.youdao.com/list") {
			// 	globalLoginDoneEvent.notify(tempuser);
			// }else{
			// 	globalFetchDoneEvent.notify();//skip and next account
			// 	console.log("username :" + tempuser+'login failed');
			// 	return false;
			// }
			console.log(response);
			alert(response.finalUrl);
		},
		onerror:function(response){
				// globalFetchDoneEvent.notify();//skip and next account
				// console.log("username :" + tempuser+'login failed');
				// return false;
		}
	});	
};
