# bead-organizer-maker

A [JSCAD](https://github.com/jscad) script for creating customizable 3d-printed beading organizers.

Run this script in JSCAD and modify parameters to create a customized beading organizer.
The part that this script generates serves as the "organizer" section, with different 
slots into which you can place beads. For example, here's a screenshot of the output
with the default parameters:

![A screenshot of the JSCAD application window. The window includes a GUI showing the default parameters and also the generated output of this repository's code -- a 3d model that is a flat rectangular prism with multiple slots into which beads can be placed.](./img/jscad-bead-organizer-screenshot.png)

In the standard usage, once you have a 3d-printed organizer from the script, you paste
it onto a thin layer of foam that serves as the base of the organizer. The combination 
of these is generally placed in a fitted box or container, with an additional layer
of acrylic as a lid to keep the beads in place when the organizer is not being used
actively.

Organizers like these are available commercially, but you are limited to the sizes
and slot configurations that the manufacturers decide to create. This script gives you
options to configure your organizer in a way that suits your needs, including:

- Overall width
- Overall height
- Thickness
- The number of "small" lettered slots in each row (the top two rows)
- The number of rows of slots that are in the side columns
- How many of those side column rows should be divided into two slots versus being one larger slot
- How many "necklace" slots to make (the long narrow slots in the center)

The easiest way to use this script is to run it directly in the hosted version of JSCAD:

1. Navigate to https://openjscad.xyz/
2. Drag `index.js` to the browser window and drop it there.

Or, even easier, just use this link to open the latest version of index.js in JSCAD:

https://openjscad.xyz/?uri=https://raw.githubusercontent.com/probertson/bead-organizer-maker/main/index.js

## Developing / Contributing

To develop this or other JSCAD scripts locally, here's the workflow that I use:

1. Clone or download JSCAD from https://github.com/jscad/OpenJSCAD.org
2. Open a terminal window and navigate to <Your JSCAD folder>/packages/web
3. Run `yarn dev` (or `npm dev`) to start the local JSCAD instance
4. Open a browser window to http://localhost:8081/ to view JSCAD
5. Drag `index.js` from the filesystem (the location of your clone of this repo) and drop it in the browser window

