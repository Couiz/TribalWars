// ==UserScript==
// @name         Couiz's PrivateFarm v2.0
// @version      2.0
// @include      https://pl104.plemiona.pl/game.php?*&screen=am_farm*
// @include      https://pl104.plemiona.pl/game.php?*&screen=report*
// @include      https://pl104.plemiona.pl/game.php?*&screen=info_village*
// @description  z dedykacja dla Roberta // bylo mnie banowac na s92
// @author       Couiz
// @run-at       document-end
// @grant        none
// ==/UserScript==
var farmVillages = [{
	id: 17552,
	cord: '349|521'
}];
var Convert = {
	msToHours: function(ms) {
		return ms / 3600000;
	},
	hoursToMs: function(hours) {
		return hours * 3600000;
	},
	msToMinutes: function(ms) {
		return ms / 60000;
	},
	minutesToMs: function(minutes) {
		return minutes * 60000;
	},
	msToSeconds: function(ms) {
		return ms / 1000;
	},
	secondsToMs: function(seconds) {
		return seconds * 1000;
	},
	dateToTimeStamp: function(dateString) {
		var date = new Date(dateString);
		return date.getTime();
		// mmddyyhh:hh
	}
};
PrivateFarm = {
	init: function() {
		switch (game_data.screen) {
			case "am_farm":
				PrivateFarm.farm.init();
				break;
			case "report":
				PrivateFarm.report.init();
				break;
			case "info_village":
				PrivateFarm.info_village.init();
		}
	},
	farm: {
		resourcesPerHour: [5, 30, 35, 41, 47, 55, 64, 74, 86, 100, 117, 136, 158, 184, 214, 249, 289, 337, 391, 455, 530, 616, 717, 833, 969, 1127, 1311, 1525, 1774, 2063, 2400],
		villages: [],
		templates: [],
		index: 0,
		init: function() {
			this.villages = farmVillages;
			this.templates = [{
				id: this.getTemplate(0),
				speed: 10,
				carry: this.getCarry(0) - (80 * 0.2)
			}, {
				id: this.getTemplate(1),
				speed: 10,
				carry: this.getCarry(1) - (80 * 0.2)
			}];
			$('#plunder_list').find('tr:not(:first)').each(function() {
				var $tr = $(this);
				var data = localStorage.getItem($tr.attr('id'));
				if (data !== null) {
					$($tr.find('td')[6]).text(JSON.parse(data).wallLvl);
				}
			});
			setTimeout(function() {
				PrivateFarm.farm.tick();
			}, 2000);
		},
		tick: function() {
			var i = this.index;
			var queue = [];
			document.cookie = 'global_village_id=' + this.villages[i].id;
			for (var j = 0, len = localStorage.length; j < len; j++) {
				if (localStorage.key(j).indexOf("village_") > -1) {
					var village = JSON.parse(localStorage.getItem(localStorage.key(j)));
					village.distance = this.calcDistance(this.villages[i].cord, village.cord);
					village.resPerHour = this.calcResources(village.woodLvl, village.stoneLvl, village.ironLvl);
					village.reachTime = Convert.minutesToMs(this.calcReachTime(village.distance, 10));
					village.resources = (Date.now() - village.lastFarm + village.reachTime) * (village.resPerHour / 3600000);
					if (village.resources >= this.templates[1].carry && village.wallLvl < 2 && village.distance < 24) {
						var data = {
							target: village.id,
							template_id: this.templates[1].id,
							source: this.villages[i].id,
							distance: village.distance,
							reachTime: village.reachTime
						};
						var x = 0;
						while (village.resources >= this.templates[1].carry && x < 1) {
							queue.push(data);
							village.resources = village.resources - this.templates[1].carry;
							x++;
						}
					}
				}
			}
			if (queue.length < 1) {
				this.nextBase();
				return;
			}
			queue.sort(this.sortByDistance);
			this.sendLoop(queue);
		},
		sendLoop: function(que) {
			if (que.length < 1) {
				this.nextBase();
				return;
			}
			var a = que.shift();
			this.sendUnit(a, function(data) {
				if (data.error) {
					switch (data.error) {
						case 'Nie możesz zaatakować gracza.':
							localStorage.removeItem('village_' + a.target);
							break;
						case 'Nie masz wystarczającej liczby jednostek':
							PrivateFarm.farm.nextBase();
							return;
					}
				}
				if (data.response) {
					if (data.response.current_units.light < 2) {
						PrivateFarm.farm.nextBase();
						return;
					}
				}
				setTimeout(function() {
					PrivateFarm.farm.sendLoop(que);
				}, 200 + 200 * Math.random());
			});
		},
		nextBase: function() {
			if (this.index + 1 >= this.villages.length) {
				this.index = 0;
				this.timeout('Cooldown:', 900000 + 900000 * Math.random());
				return;
			}
			this.index++;
			this.tick();
		},
		timeout: function(_text, _timeout) {
			setTimeout(function() {
				PrivateFarm.farm.tick();
			}, _timeout);
			console.log(_text, _timeout, 'ms.');
		},
		sendUnit: function(params, success_callback) {
			var url = '/game.php?village=' + params.source + '&screen=am_farm&mode=farm&ajaxaction=farm&json=1&&h=' + window.csrf_token;
			$.ajax({
				url: url + '&client_time=' + Math.round(Timing.getCurrentServerTime() / 1e3),
				data: {
					target: params.target,
					template_id: params.template_id,
					source: params.source
				},
				type: 'POST',
				dataType: 'json',
				headers: {
					'TribalWars-Ajax': 1
				},
				success: function(data) {
					if (success_callback) success_callback(data);
					if (data.response) {
						PrivateFarm.farm.updateLastFarm(params);
						console.log('Farm Sent: ' + params.target + '\ntemplateId: ' + params.template_id + '\nsource: ' + params.source);
					}
				},
				error: function(xhr, status) {
					PrivateFarm.farm.timeout('errorTimeout:', 120000);
					if (xhr.readyState === 0) return;
					if (xhr.status === 429) {
						console.log('Operacja została zablokowana ponieważ wysyłasz zbyt wiele zapytań do naszych serwerów.');
						return;
					}
					console.log('Żądanie nie powiodło się. Możliwe chwilowe problemy z serwerem.');
					if (typeof error_callback === 'function') error_callback();
				}
			});
		},
		updateLastFarm: function(data) {
			var a = JSON.parse(localStorage.getItem('village_' + data.target));
			a.lastFarm = Date.now() + data.reachTime;
			localStorage.setItem('village_' + data.target, JSON.stringify(a));
		},
		sortByDistance: function(a, b) {
			if (a.distance === b.distance) {
				return 0;
			} else {
				return (a.distance < b.distance) ? -1 : 1;
			}
		},
		getCarry: function(a) {
			return parseInt($('#content_value form:eq(' + a + ') > table > tbody > tr:last-child > td:last-child').text().replace('.', ''));
		},
		getTemplate: function(a) {
			return parseInt($('#content_value form:eq(' + a + ')').attr('action').split('&template_id=')[1].split("&")[0]);
			// 0a 1b
		},
		calcResources: function(woodLvl, stoneLvl, ironLvl) {
			return this.resourcesPerHour[woodLvl] + this.resourcesPerHour[stoneLvl] + this.resourcesPerHour[ironLvl];
		},
		calcReachTime: function(dist, speed) {
			return dist * speed;
		},
		calcDistance: function(a, b) {
			var villageA = a.split('|'),
				villageB = b.split('|');
			return Math.round(Math.sqrt(Math.pow(villageA[0] - villageB[0], 2) + Math.pow(villageA[1] - villageB[1], 2)) * 1000) / 1000;
		}
	},
	report: {
		init: function() {
			if (this.isBarb() && this.isScanned()) {
				var buildingData = this.getBuildingsData();
				var data = {
					id: $('#attack_info_def').find('span.village_anchor').data('id'),
					cord: this.getCord(1),
					woodLvl: buildingData.wood || 0,
					stoneLvl: buildingData.stone || 0,
					ironLvl: buildingData.iron || 0,
					wallLvl: buildingData.wall || 0,
					lastFarm: null,
					lastUpdate: Convert.dateToTimeStamp(this.getReportTime())
				};
				if (localStorage['village_' + data.id]) {
					var tmp = JSON.parse(localStorage.getItem('village_' + data.id));
					if (tmp.lastUpdate >= data.lastUpdate) {
						console.log('Older raport');
						return;
					}
					data.lastFarm = tmp.lastFarm;
				}
				this.addReport(data);
				console.log('Village ' + data.id + ' added to localStorage');
			}
		},
		addReport: function(data) {
			localStorage.setItem('village_' + data.id, JSON.stringify(data));
		},
		isScanned: function() {
			return $("#attack_spy_building_data").length > 0 ? true : false;
		},
		isBarb: function() {
			return $($('#attack_info_def').find('th')[1]).text() === '---';
		},
		getCord: function(a) {
			return $($(".village_anchor a[href*='/game.php?']")[a]).text().split('(')[1].split(')')[0];
		},
		getBuildingsData: function() {
			var array = JSON.parse($("#attack_spy_building_data").val()),
				obj = {};
			for (var i = 0; i < array.length; i++) {
				obj[array[i].id] = parseInt(array[i].level);
			}
			return obj;
		},
		getReportTime: function() {
			var time = $("td.nopad > table > tbody > tr:nth-child(2) > td:nth-child(2)").text().replace(/\n|\t/g, "");
			return time.split(".")[1] + "." + time.split(".")[0] + "." + time.split(".")[2];
		}
	},
	info_village: {
		init: function() {
			if (localStorage.getItem('village_' + VillageInfo.village_id) !== null) {
				var btn = $('<a style="cursor: pointer;"><span class="action-icon-container"><span class="icon header new_report"></span></span> Delete from localStorage</a>')
					.click(function() {
						PrivateFarm.info_village.removeVillage(VillageInfo.village_id);
						if (localStorage.getItem('village_' + VillageInfo.village_id) === null) {
							$(this).closest('tr').remove();
						}
					});
				$('<tr><td colspan="2"></td></tr>').appendTo('#content_value > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody').find('td').append(btn);
			}
		},
		removeVillage: function(item) {
			localStorage.removeItem('village_' + item);
			UI.SuccessMessage('Village ' + item + ' removed');
		}
	}
};
var a = setInterval(function() {
	if (localStorage) {
		PrivateFarm.init();
		clearInterval(a);
	}
}, 200);