// ==UserScript==
// @name         All Magnet to BT
// @version      0.1.3
// @description  找出页面的磁力链，给出对应的种子下载地址//Find out all magnet links in current page and get their torrent download URLs. In theory, it supports many sites. you can add your favorites by //@include 
// @author       wanghsinche @ 201509
// @include      https://btdigg.org/search*
// @include      http://btdigg.org/search*
// @include      http://*.jav*.*
// @include      https://*.jav*.*
// @include      http://www.torrentkitty.org/search*
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js
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

function getAllTorrentsNew() {
	var rawnodes = $('a[href^="magnet"]').get();
	var nodes = [];
	var codeList = [];
	var listLen = 0;
	var i = 0;
	for (var i = 0; i <rawnodes.length; i++) {
		if(!include(nodes,rawnodes[i])){
			nodes.push(rawnodes[i]);
		}
	};
	codeList = getAllMagnet(nodes);
	listLen = codeList.length;
	if (listLen !== 0) { //prase all magnet herf nodes into string
		for (i = 0; i < listLen; i++) {
            $(nodes[i]).after($(nodes[i]).clone().empty().html(" <img height='16px' width='16px' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAABmCAMAAAAOARRQAAAAYFBMVEUzMzP///8vLy/Z2dkaGhpWVlYsLCy3t7e/v7/s7Ow9PT26urpBQUEqKio4ODgnJydGRkb19fV1dXVvb28gICCKiorFxcVpaWkSEhLh4eHy8vJTU1Orq6uioqKQkJCqqqpDyRVnAAACRklEQVRoge2ay5KCMBBFk0YiGAgvQWfU8f//cqSUhyNqOsRbs+CuXGBOpW8CSXcLOVIRN3UVJmKmkrCqm7gYjyyGn7EuzTZVNJciBKl0a0odT2F0pdL5hEGpqvQDptgZ5RPSSpldcY8J8sw3pFWWB2NMk3ufylUqbwZM8ClKywk6TPE5SsspbpjdR3zplO2uGG1Yf6PNhre1jG4xccUKGQmtBYujqviC0VzKZf5MjpaiKDl7n5KoXThRwuGkZSFijjNE0XW7RcThmFg0WwZFrLuX1JoTt20javuYkRnehZf1ac9Ja2G/zm6+dGL4oyoR2j7c+9JzrP2hUNh+K0e+8P2x/iDf+eLijx0liR4p3P3znvLXF74/VpQHX3p//HFoM+FL7w/zff2cMu2LZ3+e+uLVnxe+ePTnpS/e/KHNm4jd4jaP89aXnjMnbha+dJrhj2XEZsaNRXHmEFmssbG0W9ysfem0doCkRy5FyjP/lMwNWasjH6N+2JTv0uFmYU5cSu20BBTlh/Cm/Gt66K+8e+KQKNdbEvXaB9OYYD884wgZa/UMs/Iw+IJZMAtmwSyYBbNg/ikGcuRQKuEcoHJyOkBR/T099FOdeCng61xKLkXKH/58Mocbgeb7k535mKNLAQhyjYJdCjFXXNSFHZV+QCVTUKkhVKILlbZDJSFRKVVUghiV7kYl71GliPmFFVCZCFT0ApXwQAVJUHkVVCwGlb5BhXxUWwKoyQLVMoJqgAG186Cak1CtVqjGMQlqg5Oopj75yRbFX9LXIf9Djz2fAAAAAElFTkSuQmCC'>").attr("target","_blank").attr("title","download torrent from torcache" ).attr("href", code2down3(codeList[i])));
		}
	}
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

$(window).load(function(){
window.setTimeout(function() { //wait 2 seconds to execute getAllTorrents() function
	getAllTorrentsNew();
}, 2000);
});


