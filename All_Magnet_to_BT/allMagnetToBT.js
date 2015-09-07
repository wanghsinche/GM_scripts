// ==UserScript==
// @name         All Magnet to BT
// @version      0.1.2
// @description  找出页面的磁力链，给出对应的种子下载地址//Find out all magnet links in current page and get their torrent download URLs. In theory, it supports many sites. you can add your favorites by //@include 
// @author       wanghsinche @ 201509
// @include      https://btdigg.org/search*
// @include      http://btdigg.org/search*
// @include      http://www.torrentkitty.org/search*
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @run-at      document-end
// @namespace https://greasyfork.org/users/326
// ==/UserScript==

function getAllMagnet() {
	var rawMagnets = $('a[href^="magnet"]');
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



function getAllTorrents() {
	var nodes = $('a[href^="magnet"]');
	var codeList = [];
	var listLen = 0;
	var i = 0;
	codeList = getAllMagnet();
	listLen = codeList.length;
	if (listLen !== 0) { //prase all magnet herf nodes into string
		for (i = 0; i < listLen; i++) {
			$(nodes[i]).after($(nodes[i]).clone().empty().html("[BT_2]").attr("target","_blank").attr("title","download torrent from torcache" ).attr("href", code2down2(codeList[i])));
			$(nodes[i]).after($(nodes[i]).clone().empty().html("[BT_1]").attr("target","_blank").attr("title","download torrent from bt.box.n0808" ).attr("href", code2down1(codeList[i])));
		}
	}
}



window.setTimeout(function() { //wait 2 seconds to execute getAllTorrents() function
	getAllTorrents();
}, 2000);
