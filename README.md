# FSM Simulator

A simple Finite State Machine simulator for educational purposes.

## Features

- Load pre-defined FSMs from a single file.
- Step forward and backward through the simulation.
- Select inputs to the FSM using buttons.
- Resizeable canvas.
- Clean and simple UI.

## How to Use

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Run `npm run build` to build the project.
4. Open `index.html` in your browser.

Alternatively, you can run `npm start` to start a local development server.

## How to Add New FSMs

1. Open `src/examples.ts`.
2. Add a new entry to the `examples` object with the following structure:

```javascript
"new_fsm_name": {
    states: {
        "State1": { x: 50, y: 50 },
        "State2": { x: 75, y: 75 },
    },
    transitions: [
        { from: "State1", to: "State2", input: "input1" },
    ],
    initialState: "State1",
    inputs: ["input1"],
}
```

## SVG Path Editing

For more complex FSMs, you may want to customize the paths of the transition arrows. This can be done using the `path_editor.py` script.

### Step 1: Generate SVG

Run the following command to generate an SVG file for a specific FSM example:

```bash
python path_editor.py generate <example_name>
```

For example:

```bash
python path_editor.py generate vending_machine
```

This will create an `fsm.svg` file in the root of the project.

### Step 2: Edit the SVG

Open the `fsm.svg` file in a vector graphics editor such as Inkscape, Adobe Illustrator, or Figma.

You can move the states (circles) and edit the transition paths.

**Important:** When editing the SVG, you should only modify the positions of the circles and the shape of the paths. Do not do any of the following, as it will break the import process:

- Do not delete or modify the `data-from`, `data-to`, or `data-input` attributes on the `<path>` elements.
- Do not delete or modify the `data-state-name` attribute on the `<circle>` elements.
- Do not change the IDs of any elements.
- Do not ungroup the elements or change the structure of the SVG file.

### Step 3: Import the Modified SVG

Once you have finished editing the paths, run the following command to import the modified SVG:

```bash
python path_editor.py import fsm.svg
```

The script will output TypeScript code to the console. Copy the `path: '...'` lines and paste them into the corresponding transitions in the `src/examples.ts` file.
