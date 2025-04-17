// ui.ts
interface Transition {
	from: string;
	input: string;
	to: string;
}

let states: string[] = [];
let transitions: Transition[] = [];
let outputs: Record<string, string> = {};

const transitionTable = document.getElementById("transition-table")?.querySelector("tbody") as HTMLTableSectionElement;
const outputTable = document.getElementById("output-table")?.querySelector("tbody") as HTMLTableSectionElement;
const stateCountDropdown = document.getElementById("stateCount") as HTMLSelectElement;
const outputCountDropdown = document.getElementById("outputCount") as HTMLSelectElement;

export function setupUI(redrawCallback: () => void): void {
	function updateStates(): void {
		const count = parseInt(stateCountDropdown.value);
		states = Array.from({ length: count }, (_, i) => `S${i}`);
	}

	function buildTransitionTable(): void {
		transitionTable.innerHTML = "";
		for (let i = 0; i < states.length; i++) {
			const row = document.createElement("tr");
			row.innerHTML = `
		  <td contenteditable="true">${states[i]}</td>
		  <td contenteditable="true">0</td>
		  <td contenteditable="true">${states[(i + 1) % states.length]}</td>
		`;
			transitionTable.appendChild(row);
		}
	}

	function buildOutputTable(): void {
		outputTable.innerHTML = "";
		const outputCols = parseInt(outputCountDropdown.value);
		for (let state of states) {
			const row = document.createElement("tr");
			row.innerHTML = `
		  <td contenteditable="true">${state}</td>
		  <td contenteditable="true">${"0".repeat(outputCols)}</td>
		`;
			outputTable.appendChild(row);
		}
	}

	function updateFSMData(): void {
		transitions = [];
		outputs = {};

		Array.from(transitionTable.rows).forEach(row => {
			const from = row.cells[0].innerText.trim();
			const input = row.cells[1].innerText.trim();
			const to = row.cells[2].innerText.trim();
			transitions.push({ from, input, to });
		});

		Array.from(outputTable.rows).forEach(row => {
			const state = row.cells[0].innerText.trim();
			const output = row.cells[1].innerText.trim();
			outputs[state] = output;
		});

		redrawCallback();
	}

	stateCountDropdown.addEventListener("change", () => {
		updateStates();
		buildTransitionTable();
		buildOutputTable();
		updateFSMData();
	});

	outputCountDropdown.addEventListener("change", () => {
		buildOutputTable();
		updateFSMData();
	});

	transitionTable.addEventListener("input", updateFSMData);
	outputTable.addEventListener("input", updateFSMData);

	updateStates();
	buildTransitionTable();
	buildOutputTable();
	updateFSMData();
}

export function getFSMData(): { states: string[]; transitions: Transition[]; outputs: Record<string, string> } {
	return { states, transitions, outputs };
}
