// ==UserScript==
// @name         淘宝直通车自动脚本
// @version      0.1
// @description  版权所有，仅限自用，禁止进一步分发，销售
// @author       wanghsinche
// @require      http://libs.useso.com/js/jquery/2.1.0/jquery.min.js
// @match        http://new.subway.simba.taobao.com
// @grant        GM_setValue
// @grant        GM_getValue
// @runat		 document-end
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

//main process,this UserScript runs in a event subscription model 
var e_legalCheck=new Event(document);
