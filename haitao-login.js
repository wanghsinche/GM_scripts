// ==UserScript==
// @name         haitao--login
// @version      0.1.1
// @description  惠惠海淘登陆切换脚本。保留一切版权。
// @author       Wanghsinche 
// @include      http://buyers.youdao.com/*
// @grant       GM_xmlhttpRequest
// @namespace https://greasyfork.org/users/326
// ==/UserScript==

var btnposition="right";//选项为 left  right  和 center
var accountlst=[
	{username:'292677146@qq.com',password:'huihuihaitao',oname:'杜洪磊'},
    {username:'15069012326@qq.com',password:'ilovechina..',oname:'杜洪磊磊'},
    {username:'hongleidu@vip.qq.com',password:'ilovechina..',oname:'杜朝月'},
    {username:'lcez_tuzi@qq.com',password:'ilovechina..',oname:'杜洪'},
    {username:'2323861569@qq.com',password:'ilovechina..',oname:'杜子腾'},
    {username:'du0329@qq.com',password:'ilovechina..',oname:'杜琪琪'},
    {username:'2271177214@qq.com',password:'ilovechina..',oname:'卢香香'},
];



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
var account_i=6;
var allMap=new Map();
var globalLoginDoneEvent=new Event();
globalLoginDoneEvent.attach(function(sender,msg){
	fetchList(msg,1);
});
var globalFetchDoneEvent=new Event();
globalFetchDoneEvent.attach(function(){
	account_i--;
	if(account_i>=0){
		fetchLogin(account_i);		
	}else{
		globalCrawlAllEvent.notify();
	}
});
var globalCrawlAllEvent=new Event();
globalCrawlAllEvent.attach(function(){
	//something later;
});


var fetchList=function(username,page){
	var baseURL="http://buyers.youdao.com/order/myorders?page=";
		GM_xmlhttpRequest({
			method:"GET",
			url:baseURL+page.toString(),
			onload:function(response){
				var orderMap=compileTOdata(username,response.responseText);
				if(orderMap.size<1){
					globalFetchDoneEvent.notify();
				}else{
					orderMap.forEach(function(value, key){
						allMap.set(key,value);
					});
					page++;
					fetchList(username,page);
				}
			}			
		});		

};
//@return {order:{username,id},order:{username,id}}
var compileTOdata=function(username,htmlText){
	var htmlel=$(htmlText);
	var orderMap=new Map();
	var orderKey,orderID;
	$('.all-list-tbody>tr',htmlel).each(function(index,val){
		var valel=$(val);
		var orderKey=$('td',valel).eq(1).attr('title');
		var orderID=$('td',valel).eq(1).text();
		orderMap.set(orderKey,{username:username,id:orderID});
	});
	return orderMap;
};

var fetchLogin=function(i){
	var loginEvent= new Event(this);	
	var loginURL='https://buyers.youdao.com/auth/login';
	var text=["username="+encodeURIComponent(accountlst[i].username),"password="+encodeURIComponent(accountlst[i].password)];
	var senddata=text.join('&');
	var _this=this;
	var tempuser=accountlst[i].username;
	GM_xmlhttpRequest({
		method:"POST",
		url:loginURL,
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data:senddata,
		onload:function(response){
			if (response.finalUrl==="http://buyers.youdao.com/list") {
				globalLoginDoneEvent.notify(tempuser);
			}else{
				globalFetchDoneEvent.notify();//skip and next account
				console.log("username :" + tempuser+'login failed');
				return false;
			}
		},
		onerror:function(response){
				globalFetchDoneEvent.notify();//skip and next account
				console.log("username :" + tempuser+'login failed');
				return false;
		}
	});	
};

fetchLogin(account_i);

var AccountClass=function(username,password,user){
	var text=["username="+encodeURIComponent(username),"password="+encodeURIComponent(password)];
	this.user=user;
	this.senddata=text.join('&');
	this.current=false;
	if($('a.drop-remove.drop-anchor').eq(1).text().substring(4)===user){
		this.current=true;
	}
};

AccountClass.prototype.postRequest=function(){
	GM_xmlhttpRequest({
		method:"POST",
		url:'https://buyers.youdao.com/auth/login',
		headers: {
		    "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data:this.senddata,
		onload:function(response){
			if (response.finalUrl==="http://buyers.youdao.com/list") {
				location.reload();
			}
		}
	});
};

AccountClass.prototype.setUI=function(){
	var temphtml="<a href='javascript:;' class='btn login-button margin-top-small' style='[css]' >[user]</a>";
	var html,css,btnEle;
	if(this.current){
		css="cursor:not-allowed;background:grey;margin:5px;padding:5px;border-radius:5px;text-decoration:none;color:white!important;";
	}else{
		css="margin:5px;padding:5px;border-radius:5px;background:#008cba;text-decoration:none;color:white!important;";
	}
	html=temphtml.replace(/\[user\]/g,this.user).replace(/\[css\]/g,css);
	btnEle=$(html);
	if(!this.current){
		btnEle.click(this,function(e){
			e.data.postRequest();
		});
	}
	$('#mylst').append(btnEle);
};

if(define){
	define(['jquery'],function($){
		var ModalClass=function(id){
			this.id=id;
			$('.modal-content').append('<div class="modal-content-body" id="'+this.id+'"></div>');
			$('body').on('click','.modal-background, .modal-close',this, function(e) {
				e.preventDefault();
				if (e.target === e.currentTarget){
					e.data.hide();
				}
			});
			this.modalContent=$('.modal-content');

		};
		ModalClass.prototype.insertHtml=function(html){
			$('#'+this.id).html(html);
		};
		ModalClass.prototype.show=function(){
			$('.modal-background,.modal-content,#'+this.id).addClass('active');
			this.modalContent.css({'margin-top':-this.modalContent.height()/2,'margin-left':-this.modalContent.width()/2});
		};
		ModalClass.prototype.hide=function(){
			$('.modal-background,.modal-content,#'+this.id).removeClass('active');
		};
		return ModalClass;
	});	
}

$('.breadcrumbs').append('<li id="mylst" style="float:'+btnposition+';"></li>');
$('.breadcrumbs a').css('line-height:58px');

for (var i = accountlst.length - 1; i >= 0; i--) {
	(new AccountClass(accountlst[i]['username'],accountlst[i]['password'],accountlst[i]['oname'])).setUI();
}

//-----------------------------------------------------------------------------------------------------------



