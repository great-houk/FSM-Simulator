import "./style.css";
import { setupFSMViewer } from "./fsm";
import { setupUI } from "./ui";

document.addEventListener("DOMContentLoaded", () => {
	const redraw = setupFSMViewer();
	setupUI(redraw);
});
