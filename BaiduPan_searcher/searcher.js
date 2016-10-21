// ==UserScript==
// @name       百度云插件+APIKey
// @namespace  
// @version    5.0.1
// @description  在百度云网盘的页面添加一个搜索框，调用搜索API搜索所有公开分享文件// To add a search frame that calls some api for searching some public shared files in BaiduYun cloud netdisk. 
// @description  For more imformation,please email me at wanghsinche@hotmail.com. 
// @include       /https?\:\/\/pan\.baidu\.com.*/
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
    var bodyNode = document.querySelector('body');
    var _self=this;
    this.UI.searchBtn.addEventListener('click',function(event) {
        /* Act on the event */
        var curr=1;
        var keyword=_self.UI.inputEle.value;
        if(keyword.replace(/\s*/,'')!==''){
            _self.searchClick.notify({curr:curr,keyword:keyword});
        }
    });
    this.UI.closeBtn.addEventListener('click',function(event) {
        /* Act on the event */
        _self.closeClick.notify();
    });
    // this.UI.inputEle.addEventListener('keyup',function(event) {
    //         var clickEvent = new MouseEvent("click");            
    //         if (event.which == 13) {
    //             _self.UI.searchBtn.dispatchEvent(clickEvent);
    //         }
    //         clickEvent = null;
    //     });
    bodyNode.addEventListener('click',function(event){
        if (event.target.className.indexOf(_self.UI.engineBtnClassName) !== -1 ) {
            _self.engineOptChange.notify(event.target.getAttribute('data-engine'));            
        }
        if (event.target.className.indexOf(_self.UI.toPageBtnClassName) !== -1 ) {
            _self.toPageClick.notify(parseInt(event.target.getAttribute('data-page'),10));
        }
    });
                  
 };
 Viewer.prototype={
    refleshEngineLst:function(){
        var template='<%for(var i in this){%>'+
                    '<li node-type="click-ele" data-engine="<%this[i]%>" class="li wxz-menu-option">'+
                            'by <%this[i]%>'+
                    '</li>'+
                    '<%}%>';
        var html=TemplateEngine(template,this.model.engineLst);
        this.UI.engineLst.innerHTML = html;
    },
    updateEngine:function(){
        this.UI.menu.textContent = this.model.engine;
    },
    show:function(){
        this.UI.myDiv.style.display = 'block';
        this.UI.bgNode.style.display = 'block';
        this.UI.myDiv.style.top = '50%';
        this.UI.myDiv.style.marginTop = (this.UI.myDiv.clientHeight / 2 * -1) + 'px';    
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

        this.UI.myContent.innerHTML = html;
    },
    close:function(){
        this.UI.myDiv.style.display = 'none';
        this.UI.bgNode.style.display = 'none';
        this.UI.inputEle.value = '';
    },
    loading:function(){
        this.UI.myContent.innerHTML = '<img  width="600px" src="data:image/gif;base64,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" />';
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
        this.UI.pagese.innerHTML = html;
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



function newInit () {
    //remove advs
    //create search bar
    document.querySelector('.header-union').remove();
    var targetNode = document.querySelector('.header-info');
    var wxzSearchBarNode = document.createElement('dd');
    wxzSearchBarNode.setAttribute('class','header-wxzbar header-info');
    wxzSearchBarNode.setAttribute('node-type','header-apps');
    wxzSearchBarNode.innerHTML =
            '<span class="wxz-menu wxz-dropdown">\
                <span class="user-name" id="wxzMenuDisplay">google</span>\
                <em class="icon icon-dropdown-arrow"></em>\
                <ul class="wxz-menu-content" id="wxz_engineLst">\
                </ul>\
            </span>\
            <form class="search-form" id="wxz_searchForm">\
                <input class="search-query" placeholder=" 搜索公开分享文件" id="wxz_input">\
                <input type="button" value="GO" class="search-button" id="wxz_searchButton">\
            </form>';
    //insert after target node
    targetNode.parentNode.insertBefore(wxzSearchBarNode,targetNode.nextSlibing);
    //background
    var wxzbgNode = document.createElement('div');
    wxzbgNode.setAttribute('class','wxz-bg');
    wxzbgNode.style.display = 'none';
    document.querySelector('body').appendChild(wxzbgNode);

    //create display frame
    var wxzDialogNode = document.createElement('div');
    wxzDialogNode.setAttribute('class','dialog dialog-gray');
    wxzDialogNode.setAttribute('id','wxz_myDiv');
    wxzDialogNode.setAttribute('style','z-index:99;postion:absolute;');
    wxzDialogNode.style.width = window.innerWidth / 3 * 2 + 'px';
    wxzDialogNode.style.left = '50%';    
    wxzDialogNode.style.marginLeft = (-1 * window.innerWidth / 3) + 'px'; 
    wxzDialogNode.innerHTML = 
        '\
            <div class="dialog-header" id="wxz_myDiv_title">\
                <h3 ><span class="dialog-header-title">搜索</span></h3>\
                <div class="dialog-control" id="wxz_closeButton"><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">×</span></span></div>\
            </div>\
            <div class="dlg-bd g-clearfix offline-list-dialog">\
                <div class="wxz-content">\
                </div>\
                <div class="offline-bottom">\
                    <div class="offline-pageing">\
                        <div class="pagese " id="wxz-pagese">\
                        </div>\
                    </div>\
            </div>\
        ';

    //append to body

    document.querySelector('body').appendChild(wxzDialogNode);


    var wxzStyleNode = document.createElement('style');
    wxzStyleNode.textContent = 
    '\
    .wxz-menu{cursor:pointer; height:100%; display:inline-block; vertical-align:middle;position:relative;}\
    .wxz-menu:hover .wxz-menu-content{display:block; z-index:99}\
    .wxz-menu:hover .icon-dropdown-arrow{transform:rotate(180);}\
    .wxz-menu-option{text-align:center;line-height:30px;cursor:pointer;background:white;color:black;border:1px solid #eff4f8;border-collapse: collapse;}\
    #wxz_searchForm{display:inline-block; vertical-align:middle;}\
    #wxz_input{padding:0 4px; border: 1px solid #c0d9fe;border-radius: 4px;line-height: 22px;}\
    #wxz_searchButton{cursor:pointer; background: #3b8cff;border: 2px solid #3b8cff;color: #f8fbff;border-radius: 6px;}\
    .wxz-menu-content{display:none; position:absolute;top:100%;left:0;width:80px;}\
    #wxzMenuDisplay{line-height: 40px; display:inline-block; width:40px;}\
    .wxz-bg{position: fixed; left: 0px; top: 0px; bottom: 0px; right: 0px; z-index: 50; background: rgb(0, 0, 0); opacity: 0.5;}\
    .wxz-content{height: 500px;line-height: 200%;text-align: left;white-space: normal;padding:0 10px;overflow:auto;}\
    .wxz-close{margin-right:20px;important;height:20px;cursor:pointer}\
    .wxz-next{margin-right:20px;float:right;height:20px;cursor:pointer}\
    .wxz-front{margin-right:40px;float:right;height:20px;cursor:pointer}\
    .wxz-content a{color:#0066FF!important;font: 14px/1.5 arial,sans-serif!important;}\
    ';
    document.querySelector('head').appendChild(wxzStyleNode);    




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
        var rawResultHTML = html.match(/<li\sclass="b_algo">(.*?)<\/li>/g);
        var b_results = document.createElement('ul');
        b_results.innerHTML = rawResultHTML;
        var b_algo_Arry = Array.prototype.slice.call(b_results.getElementsByClassName('b_algo'));
        b_algo_Arry.forEach(function(ele, index) {
            var tempResult = {
                unescapedUrl: "",
                titleNoFormatting: "",
                contentNoFormatting: ""
            };
            tempResult.unescapedUrl = ele.querySelector('h2 a').getAttribute('href');
            tempResult.titleNoFormatting = ele.querySelector('h2 a').textContent;
            tempResult.contentNoFormatting = ele.querySelector('.b_caption p').textContent;
            data.results.push(tempResult);
        });
        ////处理统计结果
        var rawResultCount=html.match(/<span.*?sb_count.*?>(.*?)<\/span>/)[1];
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
        data.cursor.resultCount=parseInt(data.cursor.resultCount.split(',').join(''));
        return data;        
    };

    bdModel.compileUrl.bing=function(_self){
        return _self.urls.bing + _self.keyword + '+site%3Apan.baidu.com' + '&first=' + (_self.curr-1)*10;
    };
    bdModel.compileUrl.google=function(_self){
        return _self.urls.google + _self.keyword + '&start=' + (_self.curr-1)*10;
    };

    var bdView=new Viewer(bdModel,{
        inputEle:document.querySelector('#wxz_input'),
        searchBtn:document.querySelector('#wxz_searchButton'),
        closeBtn:document.querySelector('#wxz_closeButton'),
        myDiv:document.querySelector('#wxz_myDiv'),
        myContent:document.querySelector('.wxz-content'),
        menu:document.querySelector('#wxzMenuDisplay'),
        engineBtnClassName:'wxz-menu-option',
        engineLst:document.querySelector('#wxz_engineLst'),
        pagese:document.querySelector('#wxz-pagese'),
        toPageBtnClassName:'page-number',
        bgNode:wxzbgNode
    });
    var bdController=new Controller(bdModel,bdView);
    bdController.refleshEngineLst();
    bdController.setEngine('bing');

}


var
t = window.setInterval(function() { //百度云把一些内容放到后面加载,因此我设置了一个延时循环，每隔200ms选择一下所需的元素，当所需的元素存在时，开始脚本，同时停止延时循环
    if (document.querySelector(".user-name") !== null) {
        window.clearInterval(t);
        newInit();
    }
    console.log('waiting');
}, 200);
