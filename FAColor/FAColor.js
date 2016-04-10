// ==UserScript==
// @name         FAColor
// @version      0.1a
// @author       Couiz
// @match        *://*.plemiona.pl/*&screen=am_farm*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Couiz/TribalWars/master/FAColor/FAColor.js
// @downloadURL  https://raw.githubusercontent.com/Couiz/TribalWars/master/FAColor/FAColor.js
// ==/UserScript==
FAColor = {
	colors: ['','FAred', 'FAgreen', 'FAblue', 'FAwhite', 'FAyellow', 'FAblack'],
	init: function() {
		var colors = this.colors;
		$('#plunder_list').find('tr').each(function(index){
			if (index < 1) {
				$(this).append('<th id="FAheader"></th>');
				return;
			}
			var $tr = $(this).closest('tr');
			var b = localStorage.getItem('FAC.' + $tr.attr('id')) || 0;
			var c = b;
			$tr.addClass(colors[b]);
			var a = $('<td id="ColorFA"></td>').click(function(){
				if (b >= colors.length - 1) b = -1;
				$tr.removeClass(colors[c]).addClass(colors[++b]);
				c = b;
				if (b==0) {
					localStorage.removeItem('FAC.' + $tr.attr('id'));
					return;
				};
				localStorage.setItem('FAC.' + $tr.attr('id'), b);
			}).css('cursor','pointer');
			$(this).append(a);
		});
	},
	addGlobalStyle: function(css) {
		var head, style;
	    head = document.getElementsByTagName('head')[0];
	    if (!head) { return; }
	    style = document.createElement('style');
	    style.type = 'text/css';
	    style.innerHTML = css;
	    head.appendChild(style);
	}
};
FAColor.addGlobalStyle("#plunder_list tr:not(.FAblack) td:last-child:hover {background: rgb(255, 128, 128);}.FAred td:not(:last-child) {background: rgb(255, 128, 128) !important;}.FAred td:last-child:hover {background: rgba(128,255,128,1) !important;}.FAgreen td:not(:last-child) {background: rgba(128,255,128,1) !important;}.FAgreen td:last-child:hover {	background: rgb(120, 161, 255) !important;}.FAblue td:not(:last-child) {background: rgb(120, 161, 255) !important;}.FAblue td:last-child:hover {background: rgb(255, 255, 255) !important;}.FAwhite td:not(:last-child) {background: rgb(255, 255, 255) !important;}.FAwhite td:last-child:hover {background: rgb(255,255,128) !important;}.FAyellow td:not(:last-child) {background: rgb(255,255,128) !important;}.FAyellow td:last-child:hover {background: rgb(128, 128, 128) !important;}.FAblack td:not(:last-child) {	background: rgb(128, 128, 128) !important;} #FAheader {background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAYCAMAAAABDBevAAAAElBMVEV4of+AgICA/4D/gID//4D///+AqHhvAAAAHUlEQVQI12NkZgADRlw0EwGagQDNSoBmIUAz4qcBIRQAVe3BqgIAAAAASUVORK5CYII=);background-repeat: no-repeat;background-size: cover;}");
var a = setInterval(function(){
	if (document.getElementById('plunder_list') && jQuery) {
		FAColor.init();
		clearInterval(a);
	}
},1); // faster load