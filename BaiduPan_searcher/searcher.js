// ==UserScript==
// @name       百度云插件+APIKey
// @namespace  
// @version    4.5.0.0 beta
// @description  在百度云网盘的页面添加一个搜索框，调用搜索API搜索所有公开分享文件// To add a search frame that calls some api for searching some public shared files in BaiduYun cloud netdisk. 
// @require        http://code.jquery.com/jquery-2.1.1.min.js
// @description  For more imformation,please email me at wang0xinzhe@gmail.com. 
// @include       http://pan.baidu.com/disk/*
// @include      https://pan.baidu.com/disk/*
// @include      https://yun.baidu.com/#from=share_yun_logo/
// @include      http://yun.baidu.com/#from=share_yun_logo/
// @grant       GM_xmlhttpRequest
// @run-at document-end
// @copyright  2014,04,20 __By Wang Hsin-che   
// ==/UserScript==

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

//Javascript-template-engine-in-just-20-line
//by by Krasimir http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
var TemplateEngine = function(html, options) {
    var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
    var add = function(line, js) {
        js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    };
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};

//////////////////////////////////////////////////////////////////////
/////jQuery draggable plugin v0.2 by Wang Hsin-che @ 2014 08///////////////
/////usage: $(selector).draggable({handel:'handle',msg:{},callfunction:function(){}});
//////////////////////////////////////////////////////////////////////
(function($) {
    $.fn.draggable = function(options) {
        var settings = $.extend({
            handle: undefined,
            msg: {},
            callfunction: function() {}
        }, options);
        var _eleFunc = function() {
            var x0, y0,
                ele = $(this),
                handle;
            handle = (settings.handle === undefined ? ele : ele.find(settings.handle).eq(0) === undefined ? ele : ele.find(settings.handle).eq(0));
            ele.css({
                position: "absolute"
            }); //make sure that the "postion" is "absolute"
            handle.bind('mousedown', function(e0) {
                handle.css({
                    cursor: "move"
                }); //set the appearance of cursor 
                x0 = ele.offset().left - e0.pageX; //*1
                y0 = ele.offset().top - e0.pageY; //*1
                $(document).bind('mousemove', function(e1) { //bind the mousemove event, caution:this event must be bind to "document"
                    ele.css({
                        left: x0 + e1.pageX,
                        top: y0 + e1.pageY
                    }); //this expression and the expression of *1 equal to "ele.origin_offset+mouse.current_offset-mouse.origin_offset"
                });
                $(document).one('mouseup', settings.msg, function(e) { //when the mouse up,unbind the mousemove event,bind only once
                    settings.callfunction(e); //callback function
                    $(document).unbind('mousemove');
                    handle.css({
                        cursor: "auto"
                    });
                });
            });

            // 從這裡開始
        };
        return this.each(_eleFunc);
    };
})(jQuery);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////



/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */

 var BaseModel=function(engineLst){
    this.keyword="";
    this.engine="default";
    this.engineLst=engineLst;
    this.jsonObj={ 
                    cursor: { 
                        estimatedResultCount: 0, 
                        resultCount: 0 }, 
                    results: []
                };
    this.curr=1;
    this.totalPage=1;
    this.urls={default:'http://',};
    this.state=false;
    this.contentUpdated=new Event(this);
    this.requestEvent=new Event(this);
 };
 BaseModel.prototype={
    setEngine:function(engine){
        this.engine=engine;
    },
    updateCurr:function(curr){
        this.curr=curr;
    },
    updateKeyword:function(keyword){
        this.keyword=keyword;
    },
    request:function(){
        this.requestEvent.notify();
        var _this=this;
        GM_xmlhttpRequest({
                    method: "GET",
                    url: _this.compileUrl[_this.engine](_this),
                    headers: {
                        "User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
                        "Accept": "text/xml" // If not specified, browser defaults will be used.
                    },
                    onload: function(response) {
                        _this.jsonObj=_this.toJson[_this.engine](response.responseText);
                        _this.totalPage=(parseInt(_this.jsonObj.cursor.resultCount)-parseInt(_this.jsonObj.cursor.resultCount)%10)/10+1;
                        _this.state=true;
                        var _self=_this;
                        _this.contentUpdated.notify(_self.state);                   
                    },
                    onerror: function() {
                        _this.jsonObj={ 
                                            cursor: { 
                                                estimatedResultCount: 0, 
                                                resultCount: 0 }, 
                                            results: []
                                        };
                        _this.totalPage=1;
                        _this.state=false;
                        var _self=_this;
                        _this.contentUpdated.notify(_self.state);           
                    }
                });
    },
    destory:function(){
        this.jsonObj={};
        this.totalPage=0;
        this.state=false; 
        this.curr=0;
        this.keyword="";
    },
    toJson:{
        default:function(text){
            var jsonObj = { 
                    cursor: { 
                        estimatedResultCount: 0, 
                        resultCount: 0 }, 
                    results: []
                };

            return jsonObj;
        },
    },
    compileUrl:{
        default:function(_this){
                return _this.url + _this.keyword + '+site%3Apan.baidu.com' + '&first=' + _this.curr;
            },        
    },
 };

 var Viewer=function(model,UIelements){
    this.model=model;
    this.UI=UIelements;
    this.searchClick=new Event(this);
    this.closeClick=new Event(this);
    this.nextClick=new Event(this);
    this.preClick=new Event(this);
    this.toPageClick=new Event(this);
    this.engineOptChange=new Event(this);

    var _self=this;
    this.UI.searchBtn.click(function(event) {
        /* Act on the event */
        var curr=1;
        var keyword=_self.UI.inputEle.val();
        if(keyword.replace(/\s*/,'')!==''){
            _self.searchClick.notify({curr:curr,keyword:keyword});
        }
    });
    this.UI.closeBtn.click(function(event) {
        /* Act on the event */
        _self.closeClick.notify();
    });
    this.UI.inputEle.keyup(function(event) {
            if (event.which == 13) {
                _self.UI.searchBtn.trigger('click');
            }
        });
    $('body').on('click',this.UI.engineBtn.selector,function(){
        var engine=$(this).data('engine');
        _self.engineOptChange.notify(engine);
    });
    $('body').on('click',this.UI.toPageBtn.selector,function(){
        var page=$(this).data('page');
        _self.toPageClick.notify(page);
    });

    this.UI.myDiv.draggable({
        handle: "#wxz_myDiv_title"
    });

                  
 };
 Viewer.prototype={
    refleshEngineLst:function(){
        var template='<%for(var i in this){%>'+
                    '<span node-type="click-ele" data-engine="<%this[i]%>" class="li wxz-menu-option">'+
                            '<a >by <%this[i]%></a>'+
                    '</span>'+
                    '<%}%>';
        var html=TemplateEngine(template,this.model.engineLst);
        this.UI.engineLst.html(html);
    },
    updateEngine:function(){
        this.UI.menu.text(this.model.engine);
    },
    show:function(){
        this.UI.myDiv.show();
    },
    reflesh:function(success){
        var template="<p align='right'>---- by <%this.engine%>.com Search </p><p white-space='normal' class='temp' >keyword is    '<%this.keyword%>'    found  '<%this.jsonObj.cursor.resultCount%>'  Results</p><p>--------------------------------------------------<p>";
        
        template+='<%for(var i in this.jsonObj.results){%>'+
                         '<p><p class="myTitle">'+
                            '<a href="<%this.jsonObj.results[i].unescapedUrl%>"target="_blank"><%this.jsonObj.results[i].titleNoFormatting%></a>'+
                         '</p>'+
                         '<p class="mySnippet"><%this.jsonObj.results[i].contentNoFormatting%></p>'+
                '<%}%>';
        template+='<p><p>-------------------------------------------------------------<p class="temp" margin-left="20px">" <%this.jsonObj.results.length%> "  items have been load </p>';
        var html;
        if(success===false){
            html='<div class="loading-tips" align="center">出错了......</div>';
        }else{
            if(this.model.jsonObj.results.length===0){
                html='<div class="loading-tips" align="center">无搜索结果...换个关键词重新试试？</div>';
            }else{
                html=TemplateEngine(template,this.model);
            }
        }

        this.UI.myContent.html(html);
    },
    close:function(){
        this.UI.myDiv.hide();
        this.UI.inputEle.val("");
    },
    loading:function(){
        this.UI.myContent.html('<img src="data:image/gif;base64,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" />');
    },
    refleshPageNavi:function(){
        var page={curr:1,totalPage:1,pre:true,next:true,lst:[]};
        page.curr=this.model.curr;
        page.totalPage=this.model.totalPage>=10?10:this.model.totalPage;
        page.pre=page.curr>1?true:false;
        page.next=page.totalPage>page.curr?true:false;
        for(var i=1;i<=page.totalPage;i++){
            page.lst.push(i);
        }
        var template= '\
                <div class="pagese "id="wxz-pagese">\
                <span class="page-content">\
                <a href="javascript:void(0)" class=" <% if(this.pre){ %> page-number <%}else{%> global-disabled <%}%> mou-evt" data-page="<%this.curr-1%>">上一页</a>\
                <%for(var i in this.lst){%>\
                    <span class="page-number <%if(this.lst[i]==this.curr){%> global-disabled <%}%>" data-page="<%this.lst[i]%>"><%this.lst[i]%></span>\
                <%}%>\
                </span>\
                <a href="javascript:void(0)" class=" <% if(this.next){ %> page-number <%}else{%> global-disabled <%}%> mou-evt" data-page="<%this.curr+1%>">下一页</a>\
                </div>\
                ';
        var html=TemplateEngine(template,page);
        this.UI.pagese.html(html);
    }
 };


 var Controller=function(model,viewer){
    this.model=model;
    this.viewer=viewer;

    var _self=this;

    this.viewer.searchClick.attach(function(sender,args){
        _self.search(args.curr,args.keyword);
    });
    this.viewer.closeClick.attach(function(){
        _self.close();
    });
    this.viewer.engineOptChange.attach(function(sender,args){
        _self.setEngine(args);
    });
    this.viewer.toPageClick.attach(function(sender,args){
        _self.toPage(args);
    });

    this.model.requestEvent.attach(function(){
        _self.loading();
    }); 
    this.model.contentUpdated.attach(function(state){
        _self.reflesh(state);
    });

 };
 Controller.prototype={
    search:function(curr,args){
        this.model.updateCurr(curr);
        this.model.updateKeyword(args);
        this.model.request();
        this.viewer.show();
    },
    setEngine:function(engine){
        this.model.setEngine(engine);
        this.viewer.updateEngine();
    },
    toPage:function(toPageNum){
        this.model.updateCurr(toPageNum);
        this.model.request();
    },
    close:function(){
        this.model.destory();
        this.viewer.close();
    },
    loading:function(){
        this.viewer.loading();
    },
    reflesh:function(){
        this.viewer.reflesh();
        this.viewer.refleshPageNavi();
    },
    refleshEngineLst:function(){
        this.viewer.refleshEngineLst();
    },
 };


 function initial(){

    //根据屏幕设置div的大小位置
    var
    html_1 = '<li node-type="click-ele pos-ele" data-key="none" class="info-i show-item">\
    <div class="search-form" id="wxz_searchForm"><input class="search-query" placeholder=" 搜索公开分享文件" id="wxz_input">\
        <input type="button" value="GO" class="search-button" id="wxz_searchButton"></div></li>',
    //显示页面的html
    html_2 = '\
    <div class="dialog dialog-gray" id="wxz_myDiv" style="z-index:99">\
    <div class="dialog-header dialog-drag" id="wxz_myDiv_title">\
    <h3 ><span class="dialog-header-title">搜索</span></h3>\
    <div class="dialog-control" id="wxz_closeButton"><span class="dialog-icon dialog-close"></span></div>\
    </div>\
    <div class="dlg-bd g-clearfix offline-list-dialog">\
    <div class="wxz-content">\
    </div>\
    <div class="dlg-bd g-clearfix offline-list-dialog">\
    <div class="offline-bottom">\
    <div class="offline-pageing">\
    <div class="pagese " id="wxz-pagese">\
    </div>\
    </div>\
    </div>\
    </div>\
    ',

    cssText = '\
    <style type="text/css">\
    #wxz_searchButton{background-image:none;cursor:pointer;background-color: rgb(155, 154, 154);color: #ffffff;}\
    .wxz-content{width: 700px;line-height: 200%;text-align: left;white-space: normal;margin-left:20px;overflow:auto;}\
    .wxz-close{margin-right:20px;important;height:20px;cursor:pointer}\
    .wxz-next{margin-right:20px;float:right;height:20px;cursor:pointer}\
    .wxz-front{margin-right:40px;float:right;height:20px;cursor:pointer}\
    .wxz-content a{color:#0066FF!important;font: 14px/1.5 arial,sans-serif!important;}\
    </style>\
            ',
    html_4='<li node-type="menu-nav" data-key="searcher" class="wxz-menu info-i wxz-dropdown has-pulldown">\
                <em class="f-icon pull-arrow"></em>\
                <span node-type="username" class="name top-username" id="wxzMenuDisplay" style="width: auto;"></span>\
                <div node-type="menu-list" class="wxz-menu-content pulldown user-info" style="display: none;">\
                    <em class="arrow"></em>\
                    <div class="content" id="wxz_engineLst" style="height:auto">\
                        </div>\
                </div>\
            </li>\
    ';
    $('div.info.clearfix ul').prepend(html_1); //切换按钮
    $('#ad-header-tips').remove(); //删除搜索栏了广告
    //          $('div.info.clearfix ul').prepend(html_1);//搜索按钮

    $('div.info.clearfix ul').prepend(html_4);//切换按钮
    $('body').append(html_2);
    $('head:first').append(cssText); //插入css

    //应用大小和页面
    $('.wxz-content').css({
    height: window.innerHeight / 3 * 2
    });
    $('#wxz_myDiv').css({
    top: window.innerHeight / 6,
    left: window.innerWidth / 4
    });



    var bdModel=new BaseModel(['bing','google']);

    bdModel.urls.bing='http://cn.bing.com/search?q=';
    bdModel.urls.google='https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY&rsz=filtered_cse&num=10&hl=en&prettyPrint=true&source=gcsc&gss=.com&sig=ee93f9aae9c9e9dba5eea831d506e69a&cx=018177143380893153305:yk0qpgydx_e&q=';

    bdModel.toJson.bing=function(html){
        var data = { cursor: { estimatedResultCount: 0, resultCount: 0 }, results: [] };
        //其中一条结果：
        //<li class="b_algo"><h2>
        //<a href="http://pan.baidu.com/wap/link?uk=2923110658&amp;shareid=3468815834&amp;third=3" target="_blank" h="ID=SERP,5101.1">YFK-<strong>RK3368</strong>-8189-20150821.rar_免费高速下载|百度云 网盘 ...</a></h2>
        //<div class="b_caption"><p>文件名:YFK-<strong>RK3368</strong>-8189-20150821.rar 文件大小:497.55M 分享者:晨芯FAE 分享时间:2015-8-21 14:07 下载次数:5 ... 登录百度云客户端送2T空间 电脑版</p>
        //<div class="b_attribution" u="0|5058|4835271386991248|8OMhcGIIj8GW08I41R5UoSyJpl2_5Pny"><cite><strong>pan.baidu.com</strong>/wap/link?uk=2923110658&amp;shareid=3468815834&amp;...</cite><span class="c_tlbxTrg">
        //<span class="c_tlbxH" H="BASE:CACHEDPAGEDEFAULT" K="SERP,5102.1"></span></span></div></div></li>
        //http://www.jb51.net/article/49083.htm在JS中解析HTML字符串示例代码：
        var el = $( '<div></div>' ); 
        el.html(html); 
        var b_results = $("#b_results", el);
        var b_algo_Arry = $("li.b_algo", b_results);
        $.each(b_algo_Arry, function(index, val) {
            var tempResult = {
                unescapedUrl: "",
                titleNoFormatting: "",
                contentNoFormatting: ""
            };
            tempResult.unescapedUrl = $(val).find("h2 a").attr('href');
            tempResult.titleNoFormatting = $(val).find("h2 a").text();
            tempResult.contentNoFormatting = $(val).find('div.b_caption p').text();
            data.results.push(tempResult);
        });
        ////处理统计结果
        var rawResultCount=$('.sb_count',b_results).text();
        var matchLst=[];    
        matchLst=rawResultCount.match(/([0-9]{1,3}(,[0-9]{3})+)/g);
        if(matchLst!==null){//匹配100,000,111之类的情况
            data.cursor.resultCount=matchLst[0].replace(',','');
        }else{
            matchLst=rawResultCount.match(/\d+/g);
            if(matchLst!==null){//匹配10 个结果之类的情况，以及1-11，共11个的情况
            data.cursor.resultCount=matchLst.pop();
            }else{//匹配无的情况
            data.cursor.resultCount=0;
            }
        }
        data.cursor.resultCount = parseInt( data.cursor.resultCount.toString(),10);
        data.cursor.estimatedResultCount = data.cursor.resultCount;
        return data;        
    };
    bdModel.toJson.google=function(responseText){
        var data=JSON.parse(responseText);
        data.cursor.resultCount=parseInt(data.cursor.resultCount.split(',').join());
        return data;        
    };

    bdModel.compileUrl.bing=function(_self){
        return _self.urls.bing + _self.keyword + '+site%3Apan.baidu.com' + '&first=' + (_self.curr-1)*10;
    };
    bdModel.compileUrl.google=function(_self){
        return _self.urls.google + _self.keyword + '&start=' + (_self.curr-1)*10;
    };

    var bdView=new Viewer(bdModel,{
        inputEle:$('#wxz_input'),
        searchBtn:$('#wxz_searchButton'),
        closeBtn:$('#wxz_closeButton'),
        myDiv:$('#wxz_myDiv'),
        myContent:$('.wxz-content'),
        menu:$('#wxzMenuDisplay'),
        engineBtn:$('.wxz-menu-option'),
        engineLst:$('#wxz_engineLst'),
        pagese:$('#wxz-pagese'),
        toPageBtn:$('.page-number'),
    });
    var bdController=new Controller(bdModel,bdView);
    bdController.refleshEngineLst();
    bdController.setEngine('bing');
 }

    var
    t = window.setInterval(function() { //百度云把一些内容放到后面加载,因此我设置了一个延时循环，每隔100ms选择一下所需的元素，当所需的元素存在时，开始脚本，同时停止延时循环
        if ($("#ad-header-tips").length > 0) {
            window.clearInterval(t);
            initial();
        }
        console.log('waiting');
    }, 100);
