import argparse
import json
import re
import xml.etree.ElementTree as ET

def main():
    parser = argparse.ArgumentParser(description='FSM SVG Path Editor')
    subparsers = parser.add_subparsers(dest='command')

    # Generate command
    generate_parser = subparsers.add_parser('generate', help='Generate an SVG file from an FSM example')
    generate_parser.add_argument('example_name', help='The name of the example in examples.ts')

    # Import command
    import_parser = subparsers.add_parser('import', help='Import a modified SVG file and generate TypeScript code')
    import_parser.add_argument('svg_file', help='The path to the modified SVG file')

    args = parser.parse_args()

    if args.command == 'generate':
        generate_svg(args.example_name)
    elif args.command == 'import':
        import_svg(args.svg_file)
    else:
        parser.print_help()

def get_examples_data():
    with open('src/examples.ts', 'r') as f:
        content = f.read()

    # Extract the examples object as a string
    match = re.search(r'export const examples = ({.*});', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find the 'examples' object in examples.ts")

    examples_str = match.group(1)

    # Convert to JSON-compatible format
    examples_str = re.sub(r'(\w+):', r'"\1":', examples_str)
    examples_str = examples_str.replace("'", '"')
    # Remove trailing commas
    examples_str = re.sub(r',(\s*[}\]])', r'\1', examples_str)

    try:
        data = json.loads(examples_str)
        return data
    except json.JSONDecodeError as e:
        print(f"Error parsing examples.ts: {e}")
        # print for debugging
        print(examples_str)
        return None

def generate_svg(example_name):
    examples = get_examples_data()
    if not examples or example_name not in examples:
        print(f"Example '{example_name}' not found.")
        return

    fsm_data = examples[example_name]

    svg = ET.Element('svg', attrib={'xmlns': 'http://www.w3.org/2000/svg', 'viewBox': '0 0 100 100', 'preserveAspectRatio': 'xMidYMid meet'})

    # Marker
    defs = ET.SubElement(svg, 'defs')
    marker = ET.SubElement(defs, 'marker', attrib={
        'id': 'arrowhead', 'viewBox': '-10 -5 10 10', 'refX': '-5', 'refY': '0',
        'markerWidth': '4', 'markerHeight': '4', 'orient': 'auto-start-reverse'
    })
    ET.SubElement(marker, 'path', attrib={'d': 'M 0 0 L -10 -5 L -10 5 Z'})

    # Transitions
    for t in fsm_data['transitions']:
        from_state = fsm_data['states'][t['from']]
        to_state = fsm_data['states'][t['to']]
        from_pos = (from_state['x'], from_state['y'])
        to_pos = (to_state['x'], to_state['y'])

        path_attribs = {
            'stroke': 'black', 'fill': 'none', 'marker-end': 'url(#arrowhead)',
            'data-from': t['from'], 'data-to': t['to'], 'data-input': t['input']
        }

        if 'path' in t:
            path_attribs['d'] = t['path']
        elif t['from'] == t['to']:
            loop_radius = 2
            # Note: This angle calculation is simplified compared to the JS version
            path_attribs['d'] = f"M {from_pos[0]} {from_pos[1]} A {loop_radius} {loop_radius} 0 1 1 {from_pos[0] - 0.1} {from_pos[1]}"
        else:
            control_point = get_control_point(from_pos, to_pos)
            path_attribs['d'] = f"M {from_pos[0]} {from_pos[1]} Q {control_point[0]} {control_point[1]} {to_pos[0]} {to_pos[1]}"

        ET.SubElement(svg, 'path', attrib=path_attribs)

        # Text for transition is not added to the static SVG to reduce clutter

    # States
    for state_name, state_data in fsm_data['states'].items():
        pos = (state_data['x'], state_data['y'])
        ET.SubElement(svg, 'circle', attrib={
            'cx': str(pos[0]), 'cy': str(pos[1]), 'r': '2', 'stroke': 'black', 'fill': 'white',
            'data-state-name': state_name
        })
        text = ET.SubElement(svg, 'text', attrib={
            'x': str(pos[0]), 'y': str(pos[1]), 'font-size': '2', 'text-anchor': 'middle', 'dominant-baseline': 'middle'
        })
        text.text = state_name

    tree = ET.ElementTree(svg)
    ET.indent(tree, space="  ", level=0)
    tree.write('fsm.svg', encoding='unicode')
    print(f"Successfully generated fsm.svg for example '{example_name}'.")

def get_control_point(p1, p2):
    mid_x = (p1[0] + p2[0]) / 2
    mid_y = (p1[1] + p2[1]) / 2
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    offset_x = -dy * 0.2
    offset_y = dx * 0.2
    return (mid_x + offset_x, mid_y + offset_y)

def import_svg(svg_file):
    try:
        tree = ET.parse(svg_file)
        root = tree.getroot()
        
        ns = {'svg': 'http://www.w3.org/2000/svg'}

        updated_states = {}
        for circle in root.findall('.//svg:circle[@data-state-name]', ns):
            state_name = circle.attrib['data-state-name']
            updated_states[state_name] = {
                'x': float(circle.attrib['cx']),
                'y': float(circle.attrib['cy'])
            }

        updated_paths = []
        for path in root.findall('.//svg:path[@data-from]', ns):
            updated_paths.append({
                'from': path.attrib['data-from'],
                'to': path.attrib['data-to'],
                'input': path.attrib['data-input'],
                'path': path.attrib['d']
            })

        if not updated_states and not updated_paths:
            print("No states or paths with data attributes found in the SVG.")
            return

        print("// Copy the following code into your examples.ts file to update the FSM:")
        
        if updated_states:
            print("\n// Updated states:")
            for name, pos in updated_states.items():
                print(f'// For state "{name}"')
                print(f'"{name}": {{ x: {pos["x"]:.2f}, y: {pos["y"]:.2f} }},')

        if updated_paths:
            print("\n// Updated paths:")
            for p in updated_paths:
                print(f"// For transition from '{p['from']}' to '{p['to']}' on input '{p['input']}'")
                print(f"path: '{p['path']}',
")

    except ET.ParseError as e:
        print(f"Error parsing SVG file: {e}")
    except FileNotFoundError:
        print(f"Error: File not found at {svg_file}")

if __name__ == '__main__':
    main()
