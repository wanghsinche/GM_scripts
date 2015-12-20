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
	{username:'2323861569@qq.com',password:'ilovechina..',oname:'杜子腾'},
	{username:'du0329@qq.com',password:'ilovechina..',oname:'杜琪琪'}
];

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



