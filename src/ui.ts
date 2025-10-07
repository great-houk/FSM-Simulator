import { FSM } from './fsm';
import { examples } from './examples';

let fsm: FSM | null = null;
let history: string[] = [];
let current_state_index = 0;
let activeInput: string | null = null;

let fsmSelect: HTMLSelectElement | null = null;
let prevStepButton: HTMLButtonElement | null = null;
let nextStepButton: HTMLButtonElement | null = null;
let currentStateSpan: HTMLSpanElement | null = null;
let inputButtonsDiv: HTMLDivElement | null = null;
let outputIndicatorsDiv: HTMLDivElement | null = null;
let logOutputDiv: HTMLDivElement | null = null;

function logToConsole(message: string): void {
	if (logOutputDiv) {
		const p = document.createElement('p');
		p.innerText = message;
		logOutputDiv.appendChild(p);
		logOutputDiv.scrollTop = logOutputDiv.scrollHeight;
	}
}

function createOutputIndicators(): void {
	if (outputIndicatorsDiv && fsm) {
		outputIndicatorsDiv.innerHTML = '';
		const outputs = fsm.getOutputs();
		for (const output of outputs) {
			const indicator = document.createElement('div');
			indicator.className = 'alert alert-secondary';
			indicator.id = `output-${output}`;
			indicator.innerText = output;
			outputIndicatorsDiv.appendChild(indicator);
		}
	}
}

function loadFSM(name: string, redrawCallback: () => void): void {
	if (logOutputDiv) {
		logOutputDiv.innerHTML = '';
	}
    fsm = new FSM(examples[name]);
    history = [fsm.getInitialState()];
    current_state_index = 0;
    fsm.set_active_state(history[current_state_index]);
    updateCurrentStateDisplay();
    createInputButtons(redrawCallback);
	createOutputIndicators();
	logToConsole(`Loaded FSM: ${name}`);
	logToConsole(`Initial state: ${fsm.getInitialState()}`);
}

function updateCurrentStateDisplay(): void {
    if (currentStateSpan) {
        currentStateSpan.innerText = history[current_state_index];
    }
}

function createInputButtons(redrawCallback: () => void): void {
    if (inputButtonsDiv && fsm) {
        inputButtonsDiv.innerHTML = '';
        const inputs = fsm.getData().inputs;

        const exclusiveGroups: Record<number, { name: string, exclusiveGroup?: number }[]> = {};
        const nonExclusiveInputs: { name: string, exclusiveGroup?: number }[] = [];

        for (const input of inputs) {
            if (input.exclusiveGroup !== undefined) {
                if (!exclusiveGroups[input.exclusiveGroup]) {
                    exclusiveGroups[input.exclusiveGroup] = [];
                }
                exclusiveGroups[input.exclusiveGroup].push(input);
            } else {
                nonExclusiveInputs.push(input);
            }
        }

        for (const groupId in exclusiveGroups) {
            const group = exclusiveGroups[groupId];
            const inputGroup = document.createElement('div');
            inputGroup.className = 'btn-group mb-2';
            inputGroup.setAttribute('role', 'group');

            for (const input of group) {
                const inputRadio = document.createElement('input');
                inputRadio.type = 'radio';
                inputRadio.className = 'btn-check';
                inputRadio.name = `input-radio-${groupId}`;
                inputRadio.id = `input-${input.name}`;
                inputRadio.autocomplete = 'off';
                if (activeInput === input.name) {
                    inputRadio.checked = true;
                }
                inputRadio.addEventListener('click', () => {
                    if (activeInput === input.name) {
                        inputRadio.checked = false;
                        activeInput = null;
                    } else {
                        activeInput = input.name;
                    }
                });

                const inputLabel = document.createElement('label');
                inputLabel.className = 'btn btn-outline-primary';
                inputLabel.setAttribute('for', `input-${input.name}`);
                inputLabel.innerText = input.name;

                inputGroup.appendChild(inputRadio);
                inputGroup.appendChild(inputLabel);
            }
            inputButtonsDiv.appendChild(inputGroup);
        }

        const nonExclusiveButtons: HTMLButtonElement[] = [];
        for (const input of nonExclusiveInputs) {
            const button = document.createElement('button');
            button.innerText = input.name;
            button.className = 'btn btn-secondary me-2 mb-2';
            button.addEventListener('click', () => {
                activeInput = input.name;
                button.classList.toggle('btn-primary');
                button.classList.toggle('btn-secondary');
            });
            nonExclusiveButtons.push(button);
            inputButtonsDiv.appendChild(button);
        }
    }
}

export function setupUI(redrawCallback: () => void): void {
    fsmSelect = document.getElementById('fsm-select') as HTMLSelectElement;
    prevStepButton = document.getElementById('prev-step') as HTMLButtonElement;
    nextStepButton = document.getElementById('next-step') as HTMLButtonElement;
    currentStateSpan = document.getElementById('current-state') as HTMLSpanElement;
            inputButtonsDiv = document.getElementById('input-buttons') as HTMLDivElement;
        	outputIndicatorsDiv = document.getElementById('output-indicators') as HTMLDivElement;
        	logOutputDiv = document.getElementById('log-output') as HTMLDivElement;	    for (const example in examples) {        const option = document.createElement('option');
        option.value = example;
        option.innerText = example;
        fsmSelect.appendChild(option);
    }

    fsmSelect.addEventListener('change', () => {
        loadFSM(fsmSelect.value, redrawCallback);
		redrawCallback();
    });

    prevStepButton.addEventListener('click', () => {
        if (current_state_index > 0) {
            current_state_index--;
            fsm?.set_active_state(history[current_state_index]);
            updateCurrentStateDisplay();
            redrawCallback();
        }
    });

	nextStepButton.addEventListener('click', () => {
		if (fsm && activeInput) {
			const current_state = history[current_state_index];
			const result = fsm.getNextState(current_state, activeInput);
			if (result) {
				const { nextState, output } = result;
				if (current_state_index === history.length - 1) {
					history.push(nextState);
					current_state_index++;
				} else {
					current_state_index++;
					history.splice(current_state_index, history.length - current_state_index, nextState);
				}
				fsm.set_active_state(nextState);
				updateCurrentStateDisplay();
				redrawCallback();
				logToConsole(`Transition: ${current_state} -> ${nextState} on input ${activeInput}`);

				if (output) {
					const outputs = Array.isArray(output) ? output : [output];
					logToConsole(`Output: ${outputs.join(', ')}`);
					for (const o of outputs) {
						const indicator = document.getElementById(`output-${o}`);
						if (indicator) {
							indicator.classList.remove('alert-secondary');
							indicator.classList.add('alert-success');
							setTimeout(() => {
								indicator.classList.remove('alert-success');
								indicator.classList.add('alert-secondary');
							}, 500);
						}
					}
				}
			}
		}
	});

    loadFSM(Object.keys(examples)[0], redrawCallback);
	redrawCallback();
}

export function getFSM(): FSM | null {
    return fsm;
}