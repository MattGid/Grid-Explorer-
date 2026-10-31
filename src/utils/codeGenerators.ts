/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoxCustomStyle, GridBlock, GridConfig, PosterConfig } from '../types/grid';

/**
 * Generates pure CSS Grid styles for the layout grid.
 */
export function generateCSSGrid(blocks: GridBlock[], config: GridConfig): string {
  const { cols, rows, gap, borderRadius } = config;

  let itemRules = '';
  blocks.forEach((block, i) => {
    const colStart = block.col + 1;
    const rowStart = block.row + 1;
    itemRules += `  .grid-module-${i + 1} {
    grid-column: ${colStart} / span ${block.colSpan};
    grid-row: ${rowStart} / span ${block.rowSpan};
  }
`;
  });

  return `/* Layout Grid — Algorithm: ${config.algorithm.toUpperCase()} (${cols}×${rows}) */
.layout-grid-container {
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  grid-template-rows: repeat(${rows}, minmax(80px, 1fr));
  gap: ${gap}px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  box-sizing: border-box;
}

.layout-grid-module {
  border-radius: ${borderRadius}px;
  border: 1px solid #d4d4d8;
  box-sizing: border-box;
  position: relative;
}

/* Individual Module Placements */
${itemRules}
/* Responsive Fallback: Single column on narrow screens */
@media (max-width: 768px) {
  .layout-grid-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .layout-grid-module {
    grid-column: span 1 !important;
    grid-row: auto !important;
  }
}`;
}

/**
 * Generates a clean React JSX component with Tailwind CSS classes (pure grid containers, no text).
 */
export function generateTailwindReact(blocks: GridBlock[], config: GridConfig): string {
  const { cols, rows, gap, borderRadius } = config;

  const gapClass = gap === 0 ? 'gap-0' : gap <= 8 ? 'gap-2' : gap <= 16 ? 'gap-4' : 'gap-6';
  const roundedClass =
    borderRadius === 0
      ? 'rounded-none'
      : borderRadius <= 8
      ? 'rounded-lg'
      : borderRadius <= 16
      ? 'rounded-xl'
      : 'rounded-2xl';

  const itemsJSX = blocks
    .map((block, i) => {
      const colStart = block.col + 1;
      const rowStart = block.row + 1;

      return `      <div
        key={${i}}
        style={{
          gridColumn: '${colStart} / span ${block.colSpan}',
          gridRow: '${rowStart} / span ${block.rowSpan}',
        }}
        className="border border-neutral-300 bg-white ${roundedClass}"
      />`;
    })
    .join('\n');

  return `import React from 'react';

export default function LayoutGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <div
        className="grid ${gapClass}"
        style={{
          gridTemplateColumns: 'repeat(${cols}, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(${rows}, minmax(100px, 1fr))',
        }}
      >
${itemsJSX}
      </div>
    </section>
  );
}`;
}

/**
 * Generates a pure geometric SVG schematic of the layout grid (no text labels).
 */
export function generateSVG(
  blocks: GridBlock[],
  config: GridConfig,
  posterConfig?: PosterConfig,
  boxStyles?: Record<string, BoxCustomStyle>
): string {
  const { cols, rows, gap, borderRadius } = config;

  const aspectRatio = posterConfig?.aspectRatio || 'grid-ratio';
  const marginPadding = posterConfig?.marginPadding ?? 28;
  const hasGridLines = posterConfig?.showGridLines !== false;
  const borderWidth = posterConfig?.gridBorderWidth ?? 1.5;

  let width = 1200;
  let height = Math.round((width / Math.max(1, cols)) * rows);
  if (aspectRatio === 'swiss-70x100') {
    height = Math.round(width * (10 / 7));
  } else if (aspectRatio === 'A4' || aspectRatio === 'A3') {
    height = Math.round(width * 1.414);
  } else if (aspectRatio === 'golden') {
    height = Math.round(width / 1.618);
  } else if (aspectRatio === 'square') {
    height = width;
  } else if (aspectRatio === 'cinema-16x9') {
    height = Math.round(width * (9 / 16));
  } else if (aspectRatio === 'landscape-4x3') {
    height = Math.round(width * (3 / 4));
  }

  const innerW = width - marginPadding * 2;
  const innerH = height - marginPadding * 2;

  const cellW = (innerW - gap * (cols - 1)) / cols;
  const cellH = (innerH - gap * (rows - 1)) / rows;

  const bgFill = '#F4F2EC';
  const moduleFill = '#FFFFFF';
  const strokeColor = '#141413';

  let rects = '';
  blocks.forEach((block, idx) => {
    const custom = { ...(block.customStyle || {}), ...(boxStyles?.[block.id] || {}) };
    if (custom.isNegativeVoid) return;

    const x = marginPadding + block.col * (cellW + gap);
    const y = marginPadding + block.row * (cellH + gap);
    const w = block.colSpan * cellW + (block.colSpan - 1) * gap;
    const h = block.rowSpan * cellH + (block.rowSpan - 1) * gap;

    const strokeAttr =
      hasGridLines && borderWidth > 0
        ? ` stroke="${strokeColor}" stroke-width="${borderWidth}"`
        : '';

    rects += `    <rect id="module-${idx + 1}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius}" fill="${moduleFill}"${strokeAttr}/>\n`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${bgFill}"/>
  <g id="grid-modules">
${rects}  </g>
</svg>`;
}

/**
 * Generates a clean JSON structure of the layout grid.
 */
export function generateJSON(blocks: GridBlock[], config: GridConfig): string {
  return JSON.stringify(
    {
      algorithm: config.algorithm,
      cols: config.cols,
      rows: config.rows,
      gap: config.gap,
      borderRadius: config.borderRadius,
      seed: config.seed,
      blocks: blocks.map((b, idx) => ({
        index: idx + 1,
        col: b.col,
        row: b.row,
        colSpan: b.colSpan,
        rowSpan: b.rowSpan,
      })),
    },
    null,
    2
  );
}
