// =============================================
// Puzzle piece SVG path generator
// Pieces interlock via matching tab/socket edges
// =============================================

export const W = 120;  // piece body width
export const H = 80;   // piece height
export const T = 22;   // tab protrusion depth
export const TR = 14;  // tab roundness
export const MID = H / 2;

export function makePiecePath(hasLeftSocket, hasRightTab) {
  const r = TR;
  let d = '';

  if (hasLeftSocket) {
    d = `M 0 0 L ${W} 0`;
    if (hasRightTab) {
      d += `
        L ${W} ${MID - r * 1.4}
        C ${W} ${MID - r * 1.4} ${W + r * 0.6} ${MID - r * 1.8}
          ${W + T * 0.7} ${MID - r * 1.1}
        C ${W + T * 1.1} ${MID - r * 0.3} ${W + T * 1.1} ${MID + r * 0.3}
          ${W + T * 0.7} ${MID + r * 1.1}
        C ${W + r * 0.6} ${MID + r * 1.8} ${W} ${MID + r * 1.4}
          ${W} ${MID + r * 1.4}
        L ${W} ${H}`;
    } else {
      d += ` L ${W} ${H}`;
    }
    d += ` L 0 ${H}`;
    d += `
      L 0 ${MID + r * 1.4}
      C 0 ${MID + r * 1.4} ${-r * 0.6} ${MID + r * 1.8}
        ${-T * 0.7} ${MID + r * 1.1}
      C ${-T * 1.1} ${MID + r * 0.3} ${-T * 1.1} ${MID - r * 0.3}
        ${-T * 0.7} ${MID - r * 1.1}
      C ${-r * 0.6} ${MID - r * 1.8} 0 ${MID - r * 1.4}
        0 ${MID - r * 1.4}
      L 0 0 Z`;
  } else {
    d = `M 0 0 L ${W} 0`;
    if (hasRightTab) {
      d += `
        L ${W} ${MID - r * 1.4}
        C ${W} ${MID - r * 1.4} ${W + r * 0.6} ${MID - r * 1.8}
          ${W + T * 0.7} ${MID - r * 1.1}
        C ${W + T * 1.1} ${MID - r * 0.3} ${W + T * 1.1} ${MID + r * 0.3}
          ${W + T * 0.7} ${MID + r * 1.1}
        C ${W + r * 0.6} ${MID + r * 1.8} ${W} ${MID + r * 1.4}
          ${W} ${MID + r * 1.4}
        L ${W} ${H}`;
    } else {
      d += ` L ${W} ${H}`;
    }
    d += ` L 0 ${H} L 0 0 Z`;
  }
  return d;
}

export function getViewBox(hasLeftSocket, hasRightTab) {
  const lPad = hasLeftSocket ? T + 4 : 4;
  const rPad = hasRightTab   ? T + 4 : 4;
  const vx   = hasLeftSocket ? -(T + 2) : -2;
  const vw   = W + lPad + rPad;
  return { vx, vy: -2, vw, vh: H + 4, svgW: vw, svgH: H + 4 };
}

// Assign puzzle shape based on position in sequence
export function getPieceShape(index, total) {
  return {
    hasLeftSocket: index > 0,
    hasRightTab:   index < total - 1,
  };
}

export const PIECE_COLORS = ['#64ffda','#4fc3f7','#a78bfa','#ffd700','#f97316','#ec4899'];
export const PIECE_GLOWS  = [
  'rgba(100,255,218','rgba(79,195,247','rgba(167,139,250',
  'rgba(255,215,0','rgba(249,115,22','rgba(236,72,153'
];