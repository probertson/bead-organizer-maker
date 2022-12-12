const jscad = require('@jscad/modeling');
const { subtract, union } = jscad.booleans;
const { colorize, colorNameToRgb } = jscad.colors;
const { extrudeLinear, extrudeRectangular } = jscad.extrusions;
const { geom2, path2 } = jscad.geometries;
const { arc, cube, cuboid, cylinder, line, triangle } = jscad.primitives;
const { vectorChar, vectorText } = jscad.text;
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
      name: 'slotsPerRow',
      type: 'int',
      caption: 'Small slots per row',
      initial: 13,
    },
  ];
}

const outerBorderThickness = 6;

const BEAD_SLOT_H_FRACTION = 0.375; // 3/8 of the vertical space

function inchesToMM(inches) {
  return inches * 25.4;
}

function main(params) {
  const {
    width: widthInches,
    height: heightInches,
    thickness,
    slotsPerRow,
  } = params;
  const width = inchesToMM(widthInches);
  const height = inchesToMM(heightInches);

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const beadSlotContainerW = width - outerBorderThickness * 2;
  const beadSlotContainerH =
    BEAD_SLOT_H_FRACTION * (height - outerBorderThickness * 2);

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
          makeBeadSlots(
            slotsPerRow,
            beadSlotContainerW,
            beadSlotContainerH,
            thickness
          )
        )
      )
    ),
  ];
}

module.exports = { main, getParameterDefinitions };

function makeBeadSlots(countPerRow, width, height, thickness) {
  const SPACE_BETWEEN_SLOTS = 5;
  const innerBordersWidth = (countPerRow - 1) * SPACE_BETWEEN_SLOTS;
  const slotWidth = (width - innerBordersWidth) / countPerRow;
  const slotHeight = (height - SPACE_BETWEEN_SLOTS) / 2;
  let offsetX = outerBorderThickness;
  let offsetY = -outerBorderThickness;

  const beadSlots = [];
  for (let i = 0; i < countPerRow; i++) {
    beadSlots.push(
      makeBeadSlot(slotWidth, slotHeight, thickness, offsetX, offsetY)
    );
    beadSlots.push(
      makeBeadSlotLabel(i, slotHeight / 9, thickness, offsetX, offsetY)
    );

    offsetX += slotWidth + SPACE_BETWEEN_SLOTS;
  }
  offsetX = outerBorderThickness;
  offsetY -= slotHeight + SPACE_BETWEEN_SLOTS;
  for (let i = 0; i < countPerRow; i++) {
    beadSlots.push(
      makeBeadSlot(slotWidth, slotHeight, thickness, offsetX, offsetY)
    );
    beadSlots.push(
      makeBeadSlotLabel(
        i + countPerRow,
        slotHeight / 9,
        thickness,
        offsetX,
        offsetY
      )
    );

    offsetX += slotWidth + SPACE_BETWEEN_SLOTS;
  }

  return beadSlots;
}

function makeBeadSlotLabel(index, height, thickness, offsetX, offsetY) {
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

function makeBeadSlot(width, height, thickness, offsetX, offsetY) {
  return extrudeLinear(
    { height: thickness },
    drawBeadSlot(width, height, offsetX, offsetY)
  );
}

function drawBeadSlot(width, height, offsetX, offsetY) {
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

// function makeLeg(length, width, holeDiameter) {
//   const leg = cuboid({ size: [length, width, width] });
//
//   const hole = rotateY(
//     degToRad(90),
//     cylinder({
//       height: length,
//       radius: holeDiameter / 2,
//     })
//   );
//
//   return translate(
//     [length / 2 + width, width / 2, width / 2],
//     subtract(leg, hole)
//   );
// }
//
// function makeBrace(braceLength, braceWidth) {
//   return translateZ(
//     braceLength,
//     rotate(
//       [degToRad(90), degToRad(90), 0],
//       extrudeLinear(
//         { height: braceWidth },
//         triangle({
//           type: 'SAS',
//           values: [braceLength, degToRad(90), braceLength],
//         })
//       )
//     )
//   );
// }
