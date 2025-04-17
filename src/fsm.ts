import p5 from 'p5';
import { getFSMData } from './ui';

interface FSMData {
	states: string[];
	transitions: { from: string; input: string; to: string }[];
	outputs: Record<string, string>;
}

export function setupCanvas(): p5 {
	let p = new p5((p: p5) => {
		p.setup = () => {
			const canvas = document.getElementById("canvas-container");
			if (canvas === null) {
				console.error("Canvas container not found");
				return;
			}
			p.createCanvas(p.windowWidth * 0.75, p.windowHeight - 60, canvas);
			p.textAlign(p.CENTER, p.CENTER);
			p.noLoop();
		};

		p.draw = () => {
			p.translate(p.width / 2, p.height / 2);
			const { states, transitions, outputs } = getFSMData();

			let min = (a: number, b: number) => (a < b ? a : b);
			const radius = min(p.width, p.height) / 2 * 0.95;
			const centerX = 0;
			const centerY = 0;
			const positions: Record<string, { x: number; y: number }> = {};

			for (let i = 0; i < states.length; i++) {
				const angle = (2 * Math.PI / states.length) * i;
				positions[states[i]] = {
					x: centerX + radius * Math.cos(angle),
					y: centerY + radius * Math.sin(angle)
				};
			}

			p.clear();
			p.background(255);

			for (let t of transitions) {
				const from = positions[t.from];
				const to = positions[t.to];
				if (!from || !to) continue;

				p.stroke(0);
				p.fill(0);

				if (t.from === t.to) {
					p.noFill();
					p.arc(from.x, from.y - 40, 40, 40, Math.PI, 0);
					p.fill(0);
					p.text(t.input, from.x, from.y - 60);
				} else {
					p.line(from.x, from.y, to.x, to.y);
					const angle = Math.atan2(to.y - from.y, to.x - from.x);
					p.push();
					p.translate(to.x, to.y);
					p.rotate(angle - Math.PI / 6);
					p.line(0, 0, -10, -5);
					p.rotate(Math.PI / 3);
					p.line(0, 0, -10, -5);
					p.pop();

					const mx = (from.x + to.x) / 2;
					const my = (from.y + to.y) / 2;
					p.fill(0);
					p.text(t.input, mx, my - 10);
				}
			}

			for (let state in positions) {
				const pos = positions[state];
				p.fill(200);
				p.stroke(0);
				p.ellipse(pos.x, pos.y, 60, 60);
				p.fill(0);
				p.text(state, pos.x, pos.y);
				p.text("Out: " + (outputs[state] ?? "-"), pos.x, pos.y + 40);
			}
		};
	});

	return p;
}