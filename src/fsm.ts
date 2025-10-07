import { getFSM } from './ui';

export interface FSMData {
	states: Record<string, { x: number; y: number; }>;
	transitions: { from: string; to: string; input: string; path?: string; output?: string | string[] }[];
	initialState: string;
    inputs: { name: string, exclusiveGroup?: number }[];
	outputs?: { name: string }[];
}

export class FSM {
	private data: FSMData;
	private active_state: string;

	constructor(data: FSMData) {
		this.data = data;
		this.active_state = data.initialState;
	}

	getInitialState(): string {
		return this.data.initialState;
	}

	set_active_state(state: string): void {
		this.active_state = state;
	}

	getInputs(): string[] {
		return this.data.inputs.map(i => i.name);
	}

	getOutputs(): string[] {
		return this.data.outputs?.map(o => o.name) || [];
	}

	getData(): FSMData {
		return this.data;
	}

	getNextState(currentState: string, input: string): { nextState: string; output: string | string[] | undefined } | null {
		const transition = this.data.transitions.find(t => t.from === currentState && t.input === input);
		return transition ? { nextState: transition.to, output: transition.output } : null;
	}

	render(svg: SVGElement): void {
		svg.innerHTML = '';
		svg.setAttribute('viewBox', '0 0 100 100');
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

		const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
		const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
		marker.setAttribute('id', 'arrowhead');
		marker.setAttribute('viewBox', '-10 -5 10 10');
		marker.setAttribute('refX', '-5');
		marker.setAttribute('refY', '0');
		marker.setAttribute('markerWidth', '4');
		marker.setAttribute('markerHeight', '4');
		marker.setAttribute('orient', 'auto-start-reverse');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', 'M 0 0 L -10 -5 L -10 5 Z');
		marker.appendChild(path);
		defs.appendChild(marker);
		svg.appendChild(defs);

		for (let t of this.data.transitions) {
			const from = this.data.states[t.from];
			const to = this.data.states[t.to];
			if (!from || !to) continue;

			const fromPos = { x: from.x, y: from.y };
			const toPos = { x: to.x, y: to.y };

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('stroke', 'black');
			path.setAttribute('fill', 'none');
			path.setAttribute('vector-effect', 'non-scaling-stroke');
			path.setAttribute('marker-end', 'url(#arrowhead)');

			if (t.path) {
				path.setAttribute('d', t.path);
			} else if (t.from === t.to) {
				const loopRadius = 2;
				const loopAngle = Math.atan2(fromPos.y - 50, fromPos.x - 50) || 0;
				const loopCenter = {
					x: fromPos.x + Math.cos(loopAngle) * loopRadius,
					y: fromPos.y + Math.sin(loopAngle) * loopRadius
				};
				path.setAttribute('d', `M ${fromPos.x} ${fromPos.y} A ${loopRadius} ${loopRadius} 0 1 1 ${fromPos.x - 0.1} ${fromPos.y}`);
			} else {
				const controlPoint = this.getControlPoint(fromPos, toPos);
                const angle = Math.atan2(toPos.y - controlPoint.y, toPos.x - controlPoint.x);
                const radius = 2;
                const toPosAdjusted = { x: toPos.x - radius * Math.cos(angle), y: toPos.y - radius * Math.sin(angle) };
				path.setAttribute('d', `M ${fromPos.x} ${fromPos.y} Q ${controlPoint.x} ${controlPoint.y} ${toPosAdjusted.x} ${toPosAdjusted.y}`);
			}
			svg.appendChild(path);

			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('font-size', '2');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.textContent = t.input;

			if (t.from === t.to) {
				const loopRadius = 2;
				const loopAngle = Math.atan2(fromPos.y - 50, fromPos.x - 50) || 0;
				const loopCenter = {
					x: fromPos.x + Math.cos(loopAngle) * loopRadius,
					y: fromPos.y + Math.sin(loopAngle) * loopRadius
				};
				text.setAttribute('x', (loopCenter.x + Math.cos(loopAngle) * (loopRadius + 2)).toString());
				text.setAttribute('y', (loopCenter.y + Math.sin(loopAngle) * (loopRadius + 2)).toString());
			} else {
				const textPos = this.getQuadraticBezierXYatT(fromPos, this.getControlPoint(fromPos, toPos), toPos, 0.5);
				text.setAttribute('x', textPos.x.toString());
				text.setAttribute('y', textPos.y.toString());
			}
			svg.appendChild(text);
		}

		for (let state in this.data.states) {
			const pos = this.data.states[state];
			const statePos = { x: pos.x, y: pos.y };

			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', statePos.x.toString());
			circle.setAttribute('cy', statePos.y.toString());
			circle.setAttribute('r', '2');
			circle.setAttribute('stroke', 'black');
			circle.setAttribute('vector-effect', 'non-scaling-stroke');
			circle.setAttribute('fill', state === this.active_state ? 'lightblue' : 'white');
			svg.appendChild(circle);

			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', statePos.x.toString());
			text.setAttribute('y', statePos.y.toString());
			text.setAttribute('font-size', '2');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('dominant-baseline', 'middle');
			text.textContent = state;
			svg.appendChild(text);
		}
	}

	private getControlPoint(from: { x: number, y: number }, to: { x: number, y: number }): { x: number, y: number } {
		const midX = (from.x + to.x) / 2;
		const midY = (from.y + to.y) / 2;
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const offsetX = -dy * 0.2;
		const offsetY = dx * 0.2;

		return { x: midX + offsetX, y: midY + offsetY };
	}

	private getQuadraticBezierXYatT(startPt: {x: number, y: number}, controlPt: {x: number, y: number}, endPt: {x: number, y: number}, T: number): {x: number, y: number} {
		const x = Math.pow(1 - T, 2) * startPt.x + 2 * (1 - T) * T * controlPt.x + Math.pow(T, 2) * endPt.x;
		const y = Math.pow(1 - T, 2) * startPt.y + 2 * (1 - T) * T * controlPt.y + Math.pow(T, 2) * endPt.y;
		return { x: x, y: y };
	}
}

	export function setupFSMViewer(): () => void {
	const svg = document.getElementById("fsm-container") as SVGElement;

	function redraw() {
		const fsm = getFSM();
		if (fsm && svg) {
			fsm.render(svg);
		}
	}

	window.addEventListener('resize', redraw);

	return redraw;
}
