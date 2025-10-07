export const examples = {
    "vending_machine": {
        states: {
            "0": { x: 50, y: 10 },
            "5": { x: 20, y: 25 },
            "10": { x: 80, y: 25 },
            "15": { x: 20, y: 40 },
            "20": { x: 80, y: 40 },
            "25": { x: 20, y: 55 },
            "30": { x: 80, y: 55 },
            "35": { x: 50, y: 70 },
        },
        transitions: [
            { from: "0", to: "5", input: "insert nickel" },
            { from: "0", to: "10", input: "insert dime" },
            { from: "0", to: "25", input: "insert quarter" },
            { from: "5", to: "10", input: "insert nickel" },
            { from: "5", to: "15", input: "insert dime" },
            { from: "5", to: "30", input: "insert quarter" },
            { from: "10", to: "15", input: "insert nickel" },
            { from: "10", to: "20", input: "insert dime" },
            { from: "10", to: "35", input: "insert quarter", output: "dispense candy" },
            { from: "15", to: "20", input: "insert nickel" },
            { from: "15", to: "25", input: "insert dime" },
            { from: "15", to: "0", input: "insert quarter", output: ["dispense candy", "change 5"] },
            { from: "20", to: "25", input: "insert nickel" },
            { from: "20", to: "30", input: "insert dime" },
            { from: "20", to: "0", input: "insert quarter", output: ["dispense candy", "change 10"] },
            { from: "25", to: "30", input: "insert nickel" },
            { from: "25", to: "35", input: "insert dime", output: "dispense candy" },
            { from: "25", to: "0", input: "insert quarter", output: ["dispense candy", "change 15"] },
            { from: "30", to: "35", input: "insert nickel", output: "dispense candy" },
            { from: "30", to: "0", input: "insert dime", output: ["dispense candy", "change 5"] },
            { from: "30", to: "0", input: "insert quarter", output: ["dispense candy", "change 20"] },
            { from: "35", to: "0", input: "insert nickel", output: ["dispense candy", "change 5"] },
            { from: "35", to: "0", input: "insert dime", output: ["dispense candy", "change 10"] },
            { from: "35", to: "0", input: "insert quarter", output: ["dispense candy", "change 25"] },
        ],
        initialState: "0",
        inputs: [{name: "insert nickel"}, {name: "insert dime"}, {name: "insert quarter"}],
        outputs: [{name: "dispense candy"}, {name: "change 5"}, {name: "change 10"}, {name: "change 15"}, {name: "change 20"}, {name: "change 25"}]
    },
    "traffic_light": {
        states: {
            "Red": { x: 50, y: 25 },
            "Green": { x: 50, y: 75 },
            "Yellow": { x: 75, y: 50 },
        },
        transitions: [
            { from: "Red", to: "Green", input: "timer" },
            { from: "Green", to: "Yellow", input: "timer" },
            { from: "Yellow", to: "Red", input: "timer" },
        ],
        initialState: "Red",
        inputs: [{name: "timer", exclusiveGroup: 0}],
    },
	"binary-division": {
		states: {
			"start": { x: 10, y: 50 },
			"q0": { x: 30, y: 50 },
			"q1": { x: 50, y: 50 },
			"q2": { x: 70, y: 50 },
			"end": { x: 90, y: 50 },
		},
		transitions: [
			{ from: "start", to: "q0", input: "" },
			{ from: "q0", to: "q1", input: "0" },
			{ from: "q0", to: "q2", input: "1" },
			{ from: "q1", to: "q0", input: "0" },
			{ from: "q1", to: "q2", input: "1" },
			{ from: "q2", to: "end", input: "" },
		],
		initialState: "start",
		inputs: [{name: "0", exclusiveGroup: 0}, {name: "1", exclusiveGroup: 0}],
	},
    "custom_path": {
        states: {
            "A": { x: 20, y: 50 },
            "B": { x: 80, y: 50 },
        },
        transitions: [
            { from: "A", to: "B", input: "auto" },
            { from: "B", to: "A", input: "custom", path: "M 78 50 C 60 30, 40 70, 22 50" }
        ],
        initialState: "A",
        inputs: [{name: "auto"}, {name: "custom", exclusiveGroup: 0}],
    }
};