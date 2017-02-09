// ==UserScript==
// @name         淘宝直通车自动脚本
// @version      0.1
// @description  版权所有，仅限自用，禁止进一步分发，销售
// @author       wanghsinche
// @require      http://libs.useso.com/js/jquery/2.1.0/jquery.min.js
// @match        http://new.subway.simba.taobao.com
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at document-end
// ==/UserScript==
/* jshint -W097 */
'use strict';

// Your code here...

/*thanks to the tutorial of mvc  at 
https://alexatnet.com/articles/model-view-controller-mvc-javascript*/


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

//legal right check 
var legal=function(){

};
legal.prototype.readLicense=function(){

};
legal.prototype.checkLicense=function(){

};
legal.prototype.regLicense=function(){

};
legal.prototype.checkFail=function(){

};
legal.prototype.checkSuccess=function(){

};

var firstTime_main=true;
var hashLst=[];
var routeIrt;
var mainHash='';

var f_fisrtRun=function(){
	$('.header-right.fr').prepend('<a id="wxz-startBtn" href="javascript:;" class="ml15">开始</a>');
	$('#wxz-startBtn').click(function(){
		var flag=$(this).data('flag')||1;
		switch(flag){
			case 1:
			var $tbody=$("tbody[id^=J_magix]");			
			$('.tbExpand-parent',$tbody).each(function(i,v){
				if($('input[type=checkbox]',v)[0].checked){
					hashLst.push($('.photo>a',v).attr('href'));
				}
			});
			if (hashLst.length===0) {
				alert('请勾选');
			}else{
				window.location.hash=hashLst.pop();				
				route.startRouteCheck();
				console.log('run');
				$(this).text('stop');
				$(this).data('flag',2);				
			}	
			break;
			case 2:
			hashLst=[];			
			console.log('stop');
			$(this).text('开始');			
			$(this).data('flag',1);
			route.stopRoute();
			break;			
		}
	});
};

var f_main=function(){
	mainHash=window.location.hash;	
	if(firstTime_main){
		f_fisrtRun();
		firstTime_main=false;	
	}else{
		if(hashLst.length>0)
			window.location.hash=hashLst.pop();
	}
};

var f_bidword=function(){
	window.setTimeout(function(){
		if(hashLst.length>0)
			window.location.hash=hashLst.pop();
		else
			window.location.hash=mainHash;
			console.log('stop');
			$('#wxz-startBtn').text('开始');			
			$('#wxz-startBtn').data('flag',1);
			route.stopRoute();				
	},2000);
};

//main process,this UserScript runs in a event subscription model 
var e_legalCheck=new Event(document);
var e_pageCheck=new Event(document);
var e_pageLoaded=new Event(document);
var e_step1=new Event(document);

e_pageLoaded.attach(function(sender,arg){
	console.log(arg+'loaded!!!!!');
	switch(arg){
		// case 'firstRun':
		// 	f_fisrtRun();
		// break;		
		case 'main':
			f_main();
		break;
		case 'bidword':
			f_bidword();
		break;
	}
});

var route={
	currentHash:'',
	preHash:'',
	routeLst:[
    	{hash:'type=item', vc:function(){
    		console.log('main');
    		f_pageLoaded('main');
    	}},
    	{hash:'bidword', vc:function(){
    		console.log('bidword');
    		f_pageLoaded('bidword');
    	}},
    	{hash:'newplace', vc:function(){
    		console.log('newplace');
    		f_pageLoaded('newplace');
    	}},    	    		    	
	],
	// hashCheck:function(){
 //        if (window.location.hash.match(this.currentHash)===null){
 //        	for(var i=0,currentRoute;i<this.routeLst.length;i++){
 //            	currentRoute = this.routeLst[i];
 //            	if (window.location.hash.match(currentRoute.hash)!==null) {
 //            		this.currentHash=currentRoute.hash;
 //            		currentRoute.vc();
 //            	}
 //        	}
 //        }
 //    },
	hashCheck:function(){
		// if (this.preHash==='') {this.preHash=window.location.hash;}
        if (window.location.hash!==this.preHash){
        	for(var i=0,currentRoute;i<this.routeLst.length;i++){
            	currentRoute = this.routeLst[i];
            	if (window.location.hash.match(currentRoute.hash)!==null) {
            		this.preHash=window.location.hash;
            		currentRoute.vc();
            	}
        	}
        }
    }, 
	refleshView:function(){
    },
    startRouteCheck:function(){
        this.currentHash="nomeaning";
        var self=this;
        routeIrt=setInterval(function(){self.hashCheck();}, 200);
	    },
	stopRoute:function(){
		window.clearInterval(routeIrt);
	},		    
};



var f_pageLoaded=function(msg){
	var n=0;
    var
    t = window.setInterval(function() { 
        if ($("[id^=J_magix] tr").length > 0) {
            window.clearInterval(t);
            console.log('loaded');
            e_pageLoaded.notify(msg);
        }else{
        	if(n>100){
            	window.clearInterval(t);
            	console.log('too late');
        	}
        }
        n++;
        // console.log('waiting');
    }, 100);	
};

// f_pageLoaded('firstRun');

route.startRouteCheck();
