import "./style.css";
import { setupCanvas } from "./fsm";
import { setupUI } from "./ui";

document.addEventListener("DOMContentLoaded", () => {
	const p = setupCanvas();
	setupUI(() => {
		p.redraw();
	});
});
