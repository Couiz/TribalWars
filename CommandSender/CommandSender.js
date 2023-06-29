// ==UserScript==
// @name         CommandSender
// @version      0.3
// @author       Couiz
// @match        *://*.plemiona.pl/*&screen=place*&try=confirm*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Couiz/TribalWars/master/CommandSender/CommandSender.js
// @downloadURL  https://raw.githubusercontent.com/Couiz/TribalWars/master/CommandSender/CommandSender.js
// ==/UserScript==

class CommandSender {
	constructor() {
		this.attackDuration = null;
		this.currentTime = null;

		this.elements = {
			offsetInput: null,
			arrivalTimeInput: null,
			serverDelayDisplay: null,
			confirmInputButton: null,
			confirmButton: null
		};
	}

	initialize() {
		this.addFormElements();
		this.initializeValues();
	}

	addFormElements() {
		const form = document.querySelector('#command-data-form');
		const tbody = form.querySelector('tbody');

		tbody.insertAdjacentHTML('beforeend', `
        <tr>
            <td>Przybycie:</td>
            <td><input type="datetime-local" id="CS_arrivalTime" step=".001"></td>
        </tr>
        <tr>
            <td>Offset:</td>
            <td><input type="number" id="CS_offsetInput"></td>
        </tr>
        <tr>
            <td>Server delay:</td>
            <td><span id="CS_serverDelay"></span></td>
        </tr>`);

		form.insertAdjacentHTML('beforeend',
			'<button type="button" id="CS_ConfirmButton" class="btn">Potwierdź</button>'
		);

	}

	get offsetTime() {
		const offset = localStorage.getItem('CS.offset');
		return offset ? Number(offset) : 0;
	}

	set offsetTime(value) {
		if (value) {
			localStorage.setItem('CS.offset', Number(value));
		}
	}

	initializeValues() {
		this.elements.confirmButton = document.querySelector('#troop_confirm_submit');
		this.elements.offsetInput = document.querySelector('#CS_offsetInput');
		this.elements.arrivalTimeInput = document.querySelector('#CS_arrivalTime');
		this.elements.confirmInputButton = document.querySelector('#CS_ConfirmButton');

		const form = document.querySelector('#command-data-form');
		const durationText = Array.from(form.querySelectorAll('td')).find(td => td.textContent.includes("Trwanie:")).nextElementSibling.textContent;

		this.attackDuration = durationText.split(':').map(Number);
		this.currentTime = this.convertToInput(new Date());

		this.elements.offsetInput.value = this.offsetTime;
		this.elements.arrivalTimeInput.value = this.currentTime;
		this.elements.confirmInputButton.addEventListener('click', () => {
			this.handleConfirmButtonClick();
		});
	}

	setServerDelay() {
		const delay = Timing.getCurrentServerTime() - Date.now();
		document.querySelector('#CS_serverDelay').textContent = `${Math.round(delay)} ms`;
	}

	handleConfirmButtonClick() {
		const { confirmInputButton, confirmButton, offsetInput } = this.elements;
		const attackTime = this.getAttackTime();

		confirmInputButton.classList.add('btn-disabled');
		confirmInputButton.disabled = true;

		this.offsetTime = offsetInput.value;

		const intervalId = setInterval(() => {
			if (Date.now() >= attackTime.getTime() + this.offsetTime) {
				confirmButton.click();
				clearInterval(intervalId);
			}
		}, 0);
	}

	getAttackTime() {
		let d = new Date(document.querySelector('#CS_arrivalTime').value.replace('T', ' '));
		d.setHours(d.getHours() - this.attackDuration[0]);
		d.setMinutes(d.getMinutes() - this.attackDuration[1]);
		d.setSeconds(d.getSeconds() - this.attackDuration[2]);
		return d;
	}

	convertToInput(t) {
		t.setHours(t.getHours() + this.attackDuration[0]);
		t.setMinutes(t.getMinutes() + this.attackDuration[1]);
		t.setSeconds(t.getSeconds() + this.attackDuration[2]);
		const a = {
			y: t.getFullYear(),
			m: t.getMonth() + 1,
			d: t.getDate(),
			time: t.toTimeString().split(' ')[0],
			ms: t.getMilliseconds()
		};
		return `${a.y}-${this.formatValue(a.m)}-${this.formatValue(a.d)}T${a.time}.${this.formatMilliseconds(a.ms)}`;
	}

	formatValue(value) {
		return value < 10 ? '0' + value : value;
	}

	formatMilliseconds(ms) {
		if (ms < 10) {
			return '00' + ms;
		} else if (ms < 100) {
			return '0' + ms;
		}
		return ms;
	}

	addGlobalStyle(css) {
		const head = document.head;
		if (!head) { return; }
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = css;
		head.appendChild(style);
	}
}

const commandSender = new CommandSender();

window.addEventListener('DOMContentLoaded', () => {
	if (!document.querySelector('#troop_confirm_submit')) {
		return;
	}

	commandSender.addGlobalStyle('#CS_arrivalTime, #CS_offsetInput {font-size: 9pt;font-family: Verdana,Arial;}');
	commandSender.initialize();

	document.querySelector('.server_info').insertAdjacentHTML('afterbegin', '<span style="float:left">CommandSender 0.3 Coded by: Couiz</span>');
});

window.addEventListener('load', () => {
	console.log(`Timing.offset_from_server: ${Timing.offset_from_server}`);
	console.log(`Timing.offset_to_server: ${Timing.offset_to_server}`);
	console.log(`server_time - my_time: ${Timing.getCurrentServerTime() - Date.now()}`);
	commandSender.setServerDelay();
});

