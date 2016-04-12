var ally = [];
var player = ["a149a", "Lord CIAGNIK", "NIEPOKORNY23", "dzikitraper91", "Couiz", "DEPECHE MODE", "dembol04", "miras37", "Kadzik", "ZETOR XXL", "sabazjosxx", "Furby", "Nemnes", "Sir jacobxd", "Szkyyton", "rickonaldo", "ZaakNeerOrok", "militandes", "detonator1234", "Abstrakcjonista", "szymuśśś", "Lord Lazzar", "ChuckNorri", "smol7", "Aufmahen"];
var world = 102;
var offset = 10000; // offset/25 = liczba sprawdzanych stron
var type = 'loot_res'; // rabuś=loot_res, grabiezca=loot_vil, agresor=kill_att, obronca=kill_def, przejecia=conquer
// Coded by: Couiz
TableMaker = {
	data: [],
	init: function() {
		for (var i = 0; i <= offset; i+=25) {
			$.ajax({
				type: "GET",
				url: 'https://pl' + world + '.plemiona.pl/guest.php?screen=ranking&mode=in_a_day&type=' + type + '&offset=' + i,
				async: false, //jestem zbyt leniwy zeby potem sortowac xd
				success: function(response) {
					var $response = $(response);
					TableMaker.toArray($response);
					console.log('Offset ' + i + ' loaded.');
				}
			})
		}
		console.clear();
		console.log(TableMaker.table(TableMaker.data));
	},
	toArray: function(page) {
		var $table = page.find('#in_a_day_ranking_table').find('tr:not(:first)');
		for (var i = 0; i < $table.length; i++) {
			var $tableRow = $($table[i]).find('td');
			TableMaker.data.push({
				rank: $($tableRow[0]).text(),
				nick: $($tableRow[1]).text().trim(),
				ally: $($tableRow[2]).text().trim(),
				result: $($tableRow[3]).text(),
				date: $($tableRow[4]).text()
			});
		}
	},
	table: function(arr) {
		var tableString = '[table][**]Ranking[||]Nazwa[||]Plemię[||]Wynik[||]Data[/**]';
		var rank = 1;
		for (var i = 0; i < arr.length; i++) {
			if (player.indexOf(TableMaker.data[i].nick) > -1 || ally.indexOf(TableMaker.data[i].ally) > -1) {
				tableString += '[*]' + rank++ + '[|][player]' + arr[i].nick + '[/player][|][ally]' + arr[i].ally + '[/ally][|]' + arr[i].result + '[|]' + arr[i].date;
			}
		}
		tableString += '[/table]';
		return tableString;
	}
};
TableMaker.init();