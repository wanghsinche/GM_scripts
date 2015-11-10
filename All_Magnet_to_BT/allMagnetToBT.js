// ==UserScript==
// @name         All Magnet to BT
// @version      0.1.4.2
// @description  找出页面的磁力链，给出对应的种子下载地址//Find out all magnet links in current page and get their torrent download URLs. In theory, it supports many sites. you can add your favorites by //@include 
// @author       wanghsinche @ 201509
// @include      https://btdigg.org/search*
// @include      http://btdigg.org/search*
// @include      http://*.jav*.*
// @include      https://*.jav*.*
// @include      http://www.torrentkitty.*/search*
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @run-at      document-end
// @namespace https://greasyfork.org/users/326
// ==/UserScript==

function getAllMagnet(rawMagnets) {
	var magnetNum = rawMagnets.length;
	var rawString = "";
	var rex = new RegExp("\\w{40}", 'g'); //regular expression to match all 40 bit code 
	if (magnetNum !== 0) { //prase all magnet herf nodes into string
		for (var i = 0; i < magnetNum; i++) {
			rawString += rawMagnets[i].toString();
		}
	}
	return rawString.match(rex); //return the code list
}



function code2down1(str) {
	var s1, s2, btih, torrentURL;
	btih = str.toLocaleUpperCase();
	s1 = btih.substr(0, 2);
	s2 = btih.substr(str.length - 2);
	torrentURL = "http://bt.box.n0808.com/" + s1 + "/" + s2 + "/" + btih + ".torrent";
	return torrentURL;
}

function code2down2(str) {
	var btih, torrentURL;
	btih = str.toLocaleUpperCase();
	torrentURL = "http://torcache.net/torrent/" + btih + ".torrent";
	return torrentURL;
}
function code2down3(str) {
	var btih, torrentURL;
	btih = str.toLocaleUpperCase();
	torrentURL = "http://www.torrent.org.cn/Home/Torrent/download?hash=" + btih;
	return torrentURL;
}

function include(Things,obj) {
	for (var i = Things.length - 1; i >= 0; i--) {
		if ($(Things[i]).attr('href')===$(obj).attr('href')){
			return true;
		}
	};
}

function setCss(){
    $('head').append('<style>.color1{background-color:#FFEB3B}.color2{background-color:#F44336}.color3{background-color:#4CAF50}a.wxz-a{ background-repeat: no-repeat;background-position: center;    display: inline-block;margin-left:5px;height: 20px;width: 20px;background-size: 20px;border-radius: 50%;background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAB/UlEQVRIS6WUDVEDQQyFWwVQBRQFFAetAkABRQGggFYBOKAoABRwDgAFFAWAA953s+nkMtn+wM5kus0leXn52X5vu7MvsyPJSML9W/ImeS/3tVH6GzCm+n5ZgtdMAbuTPNQMaiBk/CgZbke0tVpKzgrDjlsGQvb3OwSPphdSLLwygvwXwGJ3gDwIJXr9B4Poemyl8yDU9GAHkOcShMZTnr3gix6gnoH8pUyHpdnEmUlukgTbshkIqOwBh9kns6ZkyngyxvHMS3D07M5XYtOyASQaMO8wszPU5SMJwEIOnJ7EzhO7ASBjyYv7GJ355Jn6OH6KaslMALmS3IYM4qzDLNudVXOLf8bmGpCZJDatkW7igCnpUhInCJPVqOqesZnXmODsp4f/WZbo/QDwH9aIPaotk7HE98QIRGecYGhTiN2PhCWGZTwzKahQ25Pa+OEIG3+wJUsSsyXE7rQYPTlj7ieSdro4temhL02SZQRmxK1vgHKHITs32rTxcWciHgyYzGElkc7GY0MG8e1iZygZv5x1UxZxWhYot3mF487UnpkIkr7CGE0lceka6fzOUJrsmfEgncQ8EzPKgOLO2ORkrYjMO+XyDtSSQNYj2CwkS8lnYRxfCXpAgkxq52RMvAFOvG1+AWMMgtMnkkjPJhBzsrmHIXemjYwRm7waRu8XzEByGl4Ir08AAAAASUVORK5CYII=");vertical-align: middle;}</style>');
}

function getAllTorrentsNew() {
	var rawnodes = $('a[href^="magnet"]').get();
	var nodes = [];
	var codeList = [];
	var listLen = 0;
	for (var i = 0; i <rawnodes.length; i++) {
		if(!include(nodes,rawnodes[i])){
			nodes.push(rawnodes[i]);
		}
	};
	codeList = getAllMagnet(nodes);
	listLen = codeList.length;
    setCss();
   
	if (listLen !== 0) { //prase all magnet herf nodes into string
		for (var i = 0; i < listLen; i++) {
            $(nodes[i]).after($(nodes[i]).clone().addClass('wxz-a color3').empty().attr("target","_blank").attr("title","download torrent from torrent.org" ).attr("href", code2down3(codeList[i])));
			$(nodes[i]).after($(nodes[i]).clone().addClass('wxz-a color1').empty().attr("target","_blank").attr("title","download torrent from bt.box" ).attr("href", code2down1(codeList[i])));
			$(nodes[i]).after($(nodes[i]).clone().addClass('wxz-a color2').empty().attr("target","_blank").attr("title","download torrent from torcache" ).attr("href", code2down2(codeList[i])));
		}
	}
     $('.wxz-a').css('b','d');
}


function getAllTorrents() {
	var nodes = $('a[href^="magnet"]');
	var codeList = [];
	var listLen = 0;
	var i = 0;
	codeList = getAllMagnet(nodes);
	listLen = codeList.length;
	if (listLen !== 0) { //prase all magnet herf nodes into string
		for (i = 0; i < listLen; i++) {
			$(nodes[i]).after($(nodes[i]).clone().empty().html("[BT_2]").attr("target","_blank").attr("title","download torrent from torcache" ).attr("href", code2down3(codeList[i])));
		}
	}
}

var i=0


var t=window.setInterval(function() { //wait 2 seconds to execute getAllTorrents() function
    if($('a[href^="magnet"]').length>0||i>20){
        window.clearInterval(t);
        getAllTorrentsNew();
    }else{
        i++;
    }
}, 500);
