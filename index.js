const jscad = require('@jscad/modeling');
const { subtract } = jscad.booleans;
const { colorize, colorNameToRgb } = jscad.colors;
const { extrudeLinear, extrudeRectangular } = jscad.extrusions;
const { geom2, path2 } = jscad.geometries;
const { arc, cuboid, line, roundedRectangle } = jscad.primitives;
const { vectorText } = jscad.text;
const { rotate, rotateY, rotateZ, translate, translateX, translateZ } =
  jscad.transforms;
const { degToRad } = jscad.utils;

function getParameterDefinitions() {
  return [
    {
      name: 'width',
      type: 'float',
      caption: 'Width (inches)',
      initial: 10,
    },
    {
      name: 'height',
      type: 'float',
      caption: 'Height (inches)',
      initial: 7,
    },
    {
      name: 'thickness',
      type: 'float',
      caption: 'Thickness (millimeters)',
      initial: 1,
    },
    {
      name: 'letteredSlotsPerRow',
      type: 'int',
      caption: 'Small slots per row',
      initial: 13,
    },
    {
      name: 'sideColumnRows',
      type: 'int',
      caption: 'Total rows in side columns',
      initial: 3
    },
    {
      name: 'sideColumnSplitRows',
      type: 'int',
      caption: 'Split rows in side columns',
      initial: 1,
    },
  ];
}

const outerBorderThickness = 6;

const LETTERED_SLOT_HEIGHT_FRACTION = 0.375; // 3/8 of the vertical space
const SPACE_BETWEEN_SLOTS = 3;
const SIDE_COLUMN_WIDTH_FRACTION = 0.2;

function inchesToMM(inches) {
  return inches * 25.4;
}

function main(params) {
  const {
    width: widthInches,
    height: heightInches,
    thickness,
    letteredSlotsPerRow,
    sideColumnRows,
    sideColumnSplitRows,
  } = params;
  const width = inchesToMM(widthInches);
  const height = inchesToMM(heightInches);

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const letteredSlotContainerW = width - outerBorderThickness * 2;
  const letteredSlotContainerH =
    LETTERED_SLOT_HEIGHT_FRACTION * (height - outerBorderThickness * 2);

  const sideColumnContainerW =
    (width - (outerBorderThickness * 2 + SPACE_BETWEEN_SLOTS * 2)) *
    SIDE_COLUMN_WIDTH_FRACTION;
  const bottomColumnsH =
    height -
    (outerBorderThickness * 2 + (letteredSlotContainerH + SPACE_BETWEEN_SLOTS));
  const bottomColumnsY = -height + outerBorderThickness + bottomColumnsH;

  return [
    // Reset the coordinates back to the center
    translate(
      [-halfWidth, halfHeight, 0],

      // Main body
      colorize(
        colorNameToRgb('green'),
        subtract(
          // Change the coordinate system to anchor at top-left corner
          translate(
            [halfWidth, -halfHeight, thickness / 2],

            cuboid({ size: [width, height, thickness] })
          ),
          makeLetteredSlots(
            letteredSlotsPerRow,
            letteredSlotContainerW,
            letteredSlotContainerH,
            thickness
          ),
          makeSideColumn(
            sideColumnContainerW,
            bottomColumnsH,
            thickness,
            sideColumnRows,
            sideColumnSplitRows,
            outerBorderThickness,
            bottomColumnsY
          ),
          makeSideColumn(
            sideColumnContainerW,
            bottomColumnsH,
            thickness,
            sideColumnRows,
            sideColumnSplitRows,
            width - outerBorderThickness - sideColumnContainerW,
            bottomColumnsY
          )
        )
      )
    ),
  ];
}

module.exports = { main, getParameterDefinitions };

function makeSideColumn(width, height, thickness, rows, splitRows, x, y) {
  const splitSlotWidth = (width - SPACE_BETWEEN_SLOTS) / 2;
  const fullSlotWidth = width;
  const slotHeight = (height - SPACE_BETWEEN_SLOTS * (rows - 1)) / rows;
  const offsetX = x;
  let offsetY = y;

  const sideColumn = [];
  for (let i = 0; i < splitRows; i++) {
    sideColumn.push(
      makeRectangleSlot(splitSlotWidth, slotHeight, offsetX, offsetY, thickness)
    );
    sideColumn.push(
      makeRectangleSlot(
        splitSlotWidth,
        slotHeight,
        offsetX + splitSlotWidth + SPACE_BETWEEN_SLOTS,
        offsetY,
        thickness
      )
    );
    offsetY -= slotHeight + SPACE_BETWEEN_SLOTS;
  }
  for (let i = 0; i < rows - splitRows; i++) {
    sideColumn.push(
      makeRectangleSlot(fullSlotWidth, slotHeight, offsetX, offsetY, thickness)
    );
    offsetY -= slotHeight + SPACE_BETWEEN_SLOTS;
  }

  return sideColumn;
}

function makeRectangleSlot(width, height, offsetX, offsetY, thickness) {
  return extrudeLinear(
    { height: thickness },
    roundedRectangle({
      size: [width, height],
      roundRadius: 2,
      center: [offsetX + width / 2, offsetY - height / 2],
    })
  );
}

function makeLetteredSlots(countPerRow, width, height, thickness) {
  const innerBordersWidth = (countPerRow - 1) * SPACE_BETWEEN_SLOTS;
  const slotWidth = (width - innerBordersWidth) / countPerRow;
  const slotHeight = (height - SPACE_BETWEEN_SLOTS) / 2;
  let offsetX = outerBorderThickness;
  let offsetY = -outerBorderThickness;

  const letteredSlots = [];
  for (let i = 0; i < countPerRow; i++) {
    letteredSlots.push(
      makeLetteredSlot(slotWidth, slotHeight, thickness, offsetX, offsetY)
    );
    letteredSlots.push(
      makeLetteredSlotLabel(i, slotHeight / 9, thickness, offsetX, offsetY)
    );

    offsetX += slotWidth + SPACE_BETWEEN_SLOTS;
  }
  offsetX = outerBorderThickness;
  offsetY -= slotHeight + SPACE_BETWEEN_SLOTS;
  for (let i = 0; i < countPerRow; i++) {
    letteredSlots.push(
      makeLetteredSlot(slotWidth, slotHeight, thickness, offsetX, offsetY)
    );
    letteredSlots.push(
      makeLetteredSlotLabel(
        i + countPerRow,
        slotHeight / 9,
        thickness,
        offsetX,
        offsetY
      )
    );

    offsetX += slotWidth + SPACE_BETWEEN_SLOTS;
  }

  return letteredSlots;
}

function makeLetteredSlotLabel(index, height, thickness, offsetX, offsetY) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = ALPHABET[index % ALPHABET.length];

  const outlines = vectorText({
    xOffset: 0,
    yOffset: -height,
    height: height,
    extrudeOffset: 0,
    input: letter,
  });

  const paths = outlines.map((segment) => path2.fromPoints({}, segment));

  return translate(
    [offsetX, offsetY - height, thickness / 2],
    extrudeRectangular(
      {
        height: thickness / 2,
        size: 0.5,
      },
      paths
    )
  );
}

function makeLetteredSlot(width, height, thickness, offsetX, offsetY) {
  return extrudeLinear(
    { height: thickness },
    drawLetteredSlot(width, height, offsetX, offsetY)
  );
}

function drawLetteredSlot(width, height, offsetX, offsetY) {
  const cornerRadius = 2;
  const xL = offsetX;
  const xR = offsetX + width;
  const yTop = offsetY;
  const yMiddle = offsetY - height / 2;
  const yBottom = offsetY - height;

  const angleCornerL = arc({
    center: [xL + cornerRadius, yMiddle - cornerRadius],
    radius: cornerRadius,
    startAngle: Math.PI * 0.75,
    endAngle: Math.PI,
    segments: 8,
  });

  const leftWall = line([
    [xL, yMiddle - cornerRadius],
    [xL, yBottom + cornerRadius],
  ]);

  const cornerSW = arc({
    center: [xL + cornerRadius, yBottom + cornerRadius],
    radius: cornerRadius,
    startAngle: Math.PI,
    endAngle: Math.PI * 1.5,
    segments: 8,
  });

  const bottomWall = line([
    [xL + cornerRadius, yBottom],
    [xR - cornerRadius, yBottom],
  ]);

  const cornerSE = arc({
    center: [xR - cornerRadius, yBottom + cornerRadius],
    radius: cornerRadius,
    startAngle: Math.PI * 1.5,
    endAngle: 0,
    segments: 8,
  });

  const rightWall = line([
    [xR, yBottom + cornerRadius],
    [xR, yTop - cornerRadius],
  ]);

  const cornerNE = arc({
    center: [xR - cornerRadius, yTop - cornerRadius],
    radius: cornerRadius,
    startAngle: 0,
    endAngle: Math.PI * 0.5,
    segments: 8,
  });

  const angleCornerR = arc({
    center: [xR - 2 * cornerRadius, yTop - cornerRadius],
    radius: cornerRadius,
    startAngle: Math.PI * 0.5,
    endAngle: Math.PI * 0.75,
    segments: 8,
  });

  return geom2.fromPoints(
    path2.toPoints(
      path2.close(
        path2.concat(
          angleCornerL,
          leftWall,
          cornerSW,
          bottomWall,
          cornerSE,
          rightWall,
          cornerNE,
          angleCornerR
        )
      )
    )
  );
}
