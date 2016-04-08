// ==UserScript==
// @name         CommandSender
// @version      0.1
// @author       Couiz
// @match        *://*.plemiona.pl/*&screen=place*&try=confirm*
// @grant        none
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/Couiz/TribalWars/master/CommandSender/CommandSender.js
// ==/UserScript==

CommandSender = {
	confirmButton: null,
	duration: null,
	dateNow: null,
	offset: null,
	init: function() {
		$($('#command-data-form').find('tbody')[0]).append('<tr><td>Przybycie:</td><td> <input type="datetime-local" id="CStime" step=".001"> </td></tr><tr> <td>Offset:</td><td> <input type="number" id="CSoffset"> <button type="button" id="CSbutton" class="btn">Potwierdź</button> </td></tr>');
		this.confirmButton = $('#troop_confirm_go');
		this.duration = $('#command-data-form').find('td:contains("Trwanie:")').next().text().split(':');
		this.offset = localStorage.getItem('CS.offset') || -350;
		this.dateNow = this.convertToInput(new Date());
		$('#CSoffset').val(this.offset);
		$('#CStime').val(this.dateNow);
		$('#CSbutton').click(function() {
			var offset = Number($('#CSoffset').val());
			var attackTime = new Date($('#CStime').val().replace('T',' '));
			localStorage.setItem('CS.offset', offset);
			attackTime.setHours(attackTime.getHours()-CommandSender.duration[0]);
			attackTime.setMinutes(attackTime.getMinutes()-CommandSender.duration[1]);
			attackTime.setSeconds(attackTime.getSeconds()-CommandSender.duration[2]);
			CommandSender.confirmButton.addClass('btn-disabled');
			setTimeout(function() {
				CommandSender.confirmButton.click();
			},attackTime-Timing.getCurrentServerTime()+offset);
			this.disabled = true;
		});
		document.addEventListener('DOMContentLoaded', function(){
			$('.server_info').prepend('<span style="float:left" >CommandSender Coded by: Couiz (xcouiz@gmail.com)</span>');
		});
	},
	convertToInput: function(t) {
		var a = {
			y: t.getFullYear(),
			m: t.getMonth() + 1,
			d: t.getDate(),
			time: t.toTimeString().split(' ')[0],
			ms: t.getMilliseconds()
		};
		if (a.m < 10) {
			a.m = '0' + a.m;
		}
		if (a.d < 10) {
			a.d = '0' + a.d;
		}
		if (a.ms < 100) {
			a.ms = '0' + a.ms;
			if (a.ms < 10) {
				a.ms = '0' + a.ms;
			}
		}
		return a.y + '-' + a.m + '-' + a.d + 'T' + a.time + '.' + a.ms;		
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
CommandSender.addGlobalStyle('#CStime, #CSoffset {font-size: 9pt;font-family: Verdana,Arial;}#CSbutton {float:right;}');
var a = setInterval(function(){
	if (document.getElementById('command-data-form') && jQuery) {
		CommandSender.init();
		clearInterval(a);
	}
},1); // faster load