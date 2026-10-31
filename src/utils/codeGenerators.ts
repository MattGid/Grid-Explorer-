/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoxCustomStyle, GridBlock, GridConfig, PosterConfig } from '../types/grid';
import { resolveContainerFill } from './containerColorResolver';

export interface PrintExportOptions {
  paperSize?: 'A0' | 'A1' | 'A2' | 'A3' | '24x36' | '36x48';
  dpi?: 150 | 300 | 600;
  includeCropMarks?: boolean;
  includeBleed?: boolean;
  bleedMm?: number;
  paperColor?: string;
}

/**
 * Generates pure CSS Grid styles for the layout grid with container fills/gradients.
 */
export function generateCSSGrid(
  blocks: GridBlock[],
  config: GridConfig,
  posterConfig?: PosterConfig,
  boxStyles?: Record<string, BoxCustomStyle>
): string {
  const { cols, rows, gap, borderRadius } = config;

  let itemRules = '';
  blocks.forEach((block, i) => {
    const colStart = block.col + 1;
    const rowStart = block.row + 1;
    const custom = { ...(block.customStyle || {}), ...(boxStyles?.[block.id] || {}) };
    if (custom.isNegativeVoid) {
      itemRules += `  .grid-module-${i + 1} {
    grid-column: ${colStart} / span ${block.colSpan};
    grid-row: ${rowStart} / span ${block.rowSpan};
    background: transparent;
    border: 1px dashed #a1a1aa;
  }
`;
      return;
    }

    const resolved = resolveContainerFill(block, config, posterConfig?.colorConfig, custom, `css-${i}`);
    const shadowStyle = posterConfig?.colorConfig?.containerShadowStyle || 'brutalist-hard';
    let shadowCss = '';
    if (shadowStyle === 'brutalist-hard') {
      shadowCss = '    box-shadow: 3px 3px 0px #000000;\n';
    } else if (shadowStyle === 'deep-drop') {
      shadowCss = '    box-shadow: 6px 6px 0px #000000;\n';
    } else if (shadowStyle === 'win95-bevel') {
      shadowCss = '    box-shadow: inset 1.5px 1.5px 0 rgba(255,255,255,0.7), inset -1.5px -1.5px 0 rgba(0,0,0,0.6);\n';
    }

    itemRules += `  .grid-module-${i + 1} {
    grid-column: ${colStart} / span ${block.colSpan};
    grid-row: ${rowStart} / span ${block.rowSpan};
    background: ${resolved.background};
    border: ${posterConfig?.gridBorderWidth ?? 1.5}px solid #000000;
    border-radius: ${borderRadius}px;
${shadowCss}  }
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
  border: ${posterConfig?.gridBorderWidth ?? 1.5}px solid #18181b;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* Individual Module Placements & Container Fills */
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
 * Generates a clean React JSX component with Tailwind CSS classes and container fills.
 */
export function generateTailwindReact(
  blocks: GridBlock[],
  config: GridConfig,
  posterConfig?: PosterConfig,
  boxStyles?: Record<string, BoxCustomStyle>
): string {
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
      const custom = { ...(block.customStyle || {}), ...(boxStyles?.[block.id] || {}) };
      if (custom.isNegativeVoid) {
        return `      <div
        key={${i}}
        style={{
          gridColumn: '${colStart} / span ${block.colSpan}',
          gridRow: '${rowStart} / span ${block.rowSpan}',
        }}
        className="border border-dashed border-neutral-400 bg-transparent ${roundedClass}"
      />`;
      }

      const resolved = resolveContainerFill(block, config, posterConfig?.colorConfig, custom, `react-${i}`);

      return `      <div
        key={${i}}
        style={{
          gridColumn: '${colStart} / span ${block.colSpan}',
          gridRow: '${rowStart} / span ${block.rowSpan}',
          background: '${resolved.background}',
        }}
        className="border border-neutral-900 ${roundedClass} overflow-hidden"
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
 * Generates a pure geometric SVG schematic of the layout grid with container fills/gradients
 * and optional large-scale print crop marks.
 */
export function generateSVG(
  blocks: GridBlock[],
  config: GridConfig,
  posterConfig?: PosterConfig,
  boxStyles?: Record<string, BoxCustomStyle>,
  printOptions?: PrintExportOptions
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

  // Large Scale Print Dimension Adjustment
  if (printOptions?.paperSize) {
    switch (printOptions.paperSize) {
      case 'A0': // 841 x 1189 mm -> 33.11 x 46.81 in
        width = 2384;
        height = 3370;
        break;
      case 'A1': // 594 x 841 mm
        width = 1684;
        height = 2384;
        break;
      case 'A2': // 420 x 594 mm
        width = 1191;
        height = 1684;
        break;
      case 'A3':
        width = 842;
        height = 1191;
        break;
      case '24x36':
        width = 1728;
        height = 2592;
        break;
      case '36x48':
        width = 2592;
        height = 3456;
        break;
    }
  }

  const bleed = printOptions?.includeBleed ? 36 : 0;
  const totalW = width + bleed * 2;
  const totalH = height + bleed * 2;

  const innerW = width - marginPadding * 2;
  const innerH = height - marginPadding * 2;

  const cellW = (innerW - gap * (cols - 1)) / cols;
  const cellH = (innerH - gap * (rows - 1)) / rows;

  const bgFill = printOptions?.paperColor || '#FFFFFF';
  const strokeColor = '#000000';

  let defs = '';
  let rects = '';

  blocks.forEach((block, idx) => {
    const custom = { ...(block.customStyle || {}), ...(boxStyles?.[block.id] || {}) };
    if (custom.isNegativeVoid) return;

    const resolved = resolveContainerFill(
      block,
      config,
      posterConfig?.colorConfig,
      custom,
      `svg-mod-${idx}`
    );

    if (resolved.svgGradientDef) {
      defs += `    ${resolved.svgGradientDef}\n`;
    }

    const x = bleed + marginPadding + block.col * (cellW + gap);
    const y = bleed + marginPadding + block.row * (cellH + gap);
    const w = block.colSpan * cellW + (block.colSpan - 1) * gap;
    const h = block.rowSpan * cellH + (block.rowSpan - 1) * gap;

    const shadowStyle = posterConfig?.colorConfig?.containerShadowStyle || 'brutalist-hard';
    if (shadowStyle === 'brutalist-hard' || shadowStyle === 'deep-drop') {
      const sOffset = shadowStyle === 'deep-drop' ? 6 : 3;
      rects += `    <rect x="${(x + sOffset).toFixed(1)}" y="${(y + sOffset).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius}" fill="#000000"/>\n`;
    }

    const strokeAttr =
      hasGridLines && borderWidth > 0
        ? ` stroke="${strokeColor}" stroke-width="${borderWidth}"`
        : '';

    rects += `    <rect id="module-${idx + 1}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius}" fill="${resolved.svgFill}"${strokeAttr}/>\n`;
  });

  // Printer Crop Marks
  let cropMarksSvg = '';
  if (printOptions?.includeCropMarks) {
    const markLen = 24;
    const inset = bleed;
    cropMarksSvg = `
  <!-- Printer Trim & Bleed Crop Marks -->
  <g stroke="#000000" stroke-width="0.8" opacity="0.85">
    <!-- Top-Left -->
    <line x1="${inset - markLen}" y1="${inset}" x2="${inset - 4}" y2="${inset}"/>
    <line x1="${inset}" y1="${inset - markLen}" x2="${inset}" y2="${inset - 4}"/>
    <!-- Top-Right -->
    <line x1="${inset + width + 4}" y1="${inset}" x2="${inset + width + markLen}" y2="${inset}"/>
    <line x1="${inset + width}" y1="${inset - markLen}" x2="${inset + width}" y2="${inset - 4}"/>
    <!-- Bottom-Left -->
    <line x1="${inset - markLen}" y1="${inset + height}" x2="${inset - 4}" y2="${inset + height}"/>
    <line x1="${inset}" y1="${inset + height + 4}" x2="${inset}" y2="${inset + height + markLen}"/>
    <!-- Bottom-Right -->
    <line x1="${inset + width + 4}" y1="${inset + height}" x2="${inset + width + markLen}" y2="${inset + height}"/>
    <line x1="${inset + width}" y1="${inset + height + 4}" x2="${inset + width}" y2="${inset + height + markLen}"/>
  </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
  <defs>
${defs}  </defs>
  <rect width="100%" height="100%" fill="${bgFill}"/>
  <g id="grid-modules">
${rects}  </g>${cropMarksSvg}
</svg>`;
}

/**
 * Generates a clean JSON structure of the layout grid.
 */
export function generateJSON(
  blocks: GridBlock[],
  config: GridConfig,
  posterConfig?: PosterConfig,
  boxStyles?: Record<string, BoxCustomStyle>
): string {
  return JSON.stringify(
    {
      algorithm: config.algorithm,
      cols: config.cols,
      rows: config.rows,
      gap: config.gap,
      borderRadius: config.borderRadius,
      seed: config.seed,
      colorConfig: posterConfig?.colorConfig,
      blocks: blocks.map((b, idx) => {
        const custom = { ...(b.customStyle || {}), ...(boxStyles?.[b.id] || {}) };
        const resolved = resolveContainerFill(b, config, posterConfig?.colorConfig, custom, `json-${idx}`);
        return {
          index: idx + 1,
          col: b.col,
          row: b.row,
          colSpan: b.colSpan,
          rowSpan: b.rowSpan,
          isNegativeVoid: Boolean(custom.isNegativeVoid),
          fill: resolved.background,
        };
      }),
    },
    null,
    2
  );
}
