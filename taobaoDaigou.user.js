// ==UserScript==
// @name         taobaoDaigou
// @version      0.1.1
// @description  淘宝代购,保留一切版权。
// @author       Wanghsinche 
// @include      http://www.amazon.co.uk/*
// @include      http://www.amazon.co.jp/*
// @include      http://www.amazon.com/*
// @include      http://daigou.taobao.com
// @require http://libs.useso.com/js/jquery/1.9.0/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_openInTab
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
//page router settings
		var route={
			defaultRoute:'',
			currentHash:'',
			routeLst:[
		    	{hash:'#1', vc:function(appModel){
		    		requirejs(['app/selectApp/vcForView1'],function(app){
						var appViewer=new app.Viewer(appModel,{
							selectItemClass:'.item',
							templateID:'t:view_select',
							viewID:'#view_select',
						});
						var appController=new app.Controller(appModel,appViewer);
						appController.initial();
		   			});
		    	}},
		    	{hash:'#2', vc:function(appModel){
		    		requirejs(['app/selectApp/vcForView2'],function(app){
						var appViewer=new app.Viewer(appModel,{
							selectItemClass:'.problem-item',
							templateID:'t:view_problem',
							viewID:'#view_select',
							textAreaID:'#textPro',
						});
						var appController=new app.Controller(appModel,appViewer);
						appController.initial();
		   			});
		    	}},
		    	{hash:'#4', vc:function(appModel){
		    		requirejs(['app/selectApp/vcForView4'],function(app){
						var appViewer=new app.Viewer(appModel,{
							selectItemClass:'.serve-item',
							templateID:'t:view_serve',
							viewID:'#view_select',
						});
						var appController=new app.Controller(appModel,appViewer);
						appController.initial();
		   			});
		    	}},		    	
	    	],
	    	hashCheck:function(model){
		        if (window.location.hash != this.currentHash){
		        	for(var i=0,currentRoute;i<this.routeLst.length;i++){
		            	currentRoute = this.routeLst[i];
		                if (window.location.hash == currentRoute.hash){
		            		this.currentHash = window.location.hash;                   
		                    currentRoute.vc(model);
		                    this.refleshView(model);
		                	break;
		                }
		        	}
		        }
		    },
			refleshView:function(model){
				var self=this;
        		$('.process-item').removeClass('active');
        		$.each($('.process-item>a'),function(index,val){
        			$(val).parent().addClass('active');
        			if($(val).attr('href').toString()===self.currentHash)
        				return false;
        		});
		    },
		    startRoute:function(defaultRoute,model){
		        window.location.hash = window.location.hash || defaultRoute;
		        this.defaultRoute=defaultRoute;
		        this.currentHash="";
		        var self=this;
		        setInterval(function(){self.hashCheck(model);}, 200);
  		    },		    
		};
//////////////////////////////////
var afterLoaded=function(response){
	var existParttern="商品已经存在";
	var successParttern="itemPublish.htm";
	var hasPostedParttern="已经存在该商品";
	if (response.finalUrl.match(existParttern)===null) {
		//商品不存在，继续
		if (response.finalUrl.match(successParttern)===null){
			//未知类型，退出
			alert('未知类型');
			// console.log('1');
		}else{
			//已知类型
			if (response.responseText.match(hasPostedParttern)===null) {
				//可以提交
				GM_openInTab(response.finalUrl,false);
			}else{
				//已经提交
				alert(hasPostedParttern);
							// console.log('2');

			}
			
		}
	}
	else{
		//商品存在
		alert(existParttern);
					// console.log('3');

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
var fetchLogin=function(i){
	var loginEvent= new Event(this);
	var loginURL='http://daigou.taobao.com/buyer/index.htm';
	var suburl=getURL();
	var text=["action="+encodeURIComponent('/buyer/submit_url_action'),"event_submit_do_submit_url="+encodeURIComponent('anything'),"_tb_token_="+encodeURIComponent('LUHLJE8DqGtdw64'),"itemUrl="+encodeURIComponent(suburl)];
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
$('#productTitle').append('<button id="wxzBtn" class="">check</button>');
$('#wxzBtn').click(function(){
	fetchLogin();
});
