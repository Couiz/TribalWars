/////////////////////////////
var distanceMax = 24;
var base = ["421|437", "419|422", "420|434", "410|444", "409|426", "412|427", "413|410"];
var world = 102;
/////////////////////////////
// Couiz's FarmList Generator v0.2
// Coded by: Couiz
/////////////////////////////
var farmList = [];

$.ajax({
	type: "GET",
	url: "https://pl" + world + ".plemiona.pl/map/village.txt",
	success: function(response) {
		searchFarm(response);
		show();
	}
});

function searchFarm(data) {
	var rows = data.split("\n");
	for (var i = 0, len = rows.length; i < len; i++) {
		var farm = rows[i].split(",");
		farm = {
			villageId: farm[0],
			name: decodeURI(farm[1]).replace("+", " "),
			cord: farm[2] + "|" + farm[3],
			playerId: farm[4],
			points: farm[5]
		};
		for (var j = 0, len_ = base.length; j < len_; j++) {
			if (calcDistance(base[j], farm.cord) <= distanceMax && farm.playerId === "0") {
				farmList.push(farm);
				break;
			}
		}
	}
}

function show()
{
	var a = "",
		b = "";
	farmList.forEach(function(vil) {
		a += "<tr><td>" + vil.villageId + "</td><td>" + vil.name + "</td><td>" + vil.cord + "</td><td>" + vil.playerId + "</td><td>" + vil.points + "</td></tr>";
		b += vil.cord + " ";
	});
	var w = window.open("", "Couiz\'s farmList", "resizable=yes, scrollbars=no, height=600, width=600, titlebar=no");
	w.document.write('<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Couiz\'s farmList</title><style>body {background-image: url(https://dspl.innogamescdn.com/8.42.1/28198/graphic/index/main_bg.jpg);}.container {min-width:240px;width: 100%;}.farmList {margin: 0 0 20px 0;border: 1px black solid;border-spacing: 2px;width: inherit;box-shadow: 0 10px 10px -10px black;}.farmList tr > th {color: black;background-color: #c1a264 !important;background-image: url(https://dspl.innogamescdn.com/8.42.1/28198/graphic/screen/tableheader_bg3.png);background-repeat: repeat-x;}.farmList tr:nth-child(even) {background: #f0e2be;}.farmList tr:nth-child(odd) {background: #fff5da;}.farmList tr > td {font-weight: 700;color: #603000;}.farmList tr > td:hover {color: red;}textarea {border: 1px black solid;height: 200px;width: inherit;box-shadow: 0 10px 10px -10px black;}</style></head><body><div class="container"><table class="farmList"><tr><th>ID wioski</th><th>Nazwa</th><th>Kordy</th><th>ID gracza</th><th>Punkty</th></tr>' + a + '</table><textarea>' + b + '</textarea></div></body></html>');
	w.document.close();
}

function calcDistance(a,b) {
	var villageA = a.split('|');
	var villageB = b.split('|');
	return Math.round(Math.sqrt(Math.pow(villageA[0] - villageB[0], 2) + Math.pow(villageA[1] - villageB[1], 2)) * 1000) / 1000;
}