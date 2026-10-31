/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlgorithmicStep,
  GridBlock,
  GridConfig,
  GridSpanCandidate,
  GridStats,
  LayoutAlgorithmType,
} from '../types/grid';
import { PRNG } from './prng';
export function createBooleanGrid(cols: number, rows: number): boolean[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(true));
}

export function cloneGrid(grid: boolean[][]): boolean[][] {
  return grid.map((row) => [...row]);
}

export function canPlaceRectangle(
  grid: boolean[][],
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number
): { valid: boolean; fits: boolean; outOfBounds: boolean; collidingCell?: { x: number; y: number } } {
  if (x + w > cols || y + h > rows) {
    return { valid: false, fits: false, outOfBounds: true };
  }
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      if (!grid[r][c]) {
        return { valid: false, fits: false, outOfBounds: false, collidingCell: { x: c, y: r } };
      }
    }
  }
  return { valid: true, fits: true, outOfBounds: false };
}

export function markOccupied(
  grid: boolean[][],
  x: number,
  y: number,
  w: number,
  h: number
): void {
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      if (grid[r] && c < grid[r].length) {
        grid[r][c] = false;
      }
    }
  }
}

export function parseAllowedSpans(
  configOrSpans: GridConfig | string[],
  maxColSpanArg?: number,
  maxRowSpanArg?: number,
  minColSpanArg: number = 1,
  minRowSpanArg: number = 1
): GridSpanCandidate[] {
  const allowedSpans = Array.isArray(configOrSpans)
    ? configOrSpans
    : configOrSpans.allowedSpans;
  const maxColSpan = Array.isArray(configOrSpans)
    ? maxColSpanArg ?? 12
    : configOrSpans.maxColSpan;
  const maxRowSpan = Array.isArray(configOrSpans)
    ? maxRowSpanArg ?? 12
    : configOrSpans.maxRowSpan;
  const minColSpan = Array.isArray(configOrSpans)
    ? minColSpanArg
    : configOrSpans.minColSpan;
  const minRowSpan = Array.isArray(configOrSpans)
    ? minRowSpanArg
    : configOrSpans.minRowSpan;

  const candidates: GridSpanCandidate[] = [];
  for (const s of allowedSpans) {
    const [wStr, hStr] = s.toLowerCase().split('x');
    const w = parseInt(wStr, 10);
    const h = parseInt(hStr, 10);
    if (
      !isNaN(w) &&
      !isNaN(h) &&
      w >= minColSpan &&
      h >= minRowSpan &&
      w <= maxColSpan &&
      h <= maxRowSpan
    ) {
      candidates.push({ w, h, label: `${w}×${h}`, weight: 1 });
    }
  }
  if (candidates.length === 0) {
    candidates.push({ w: 1, h: 1, label: '1×1', weight: 1 });
  }
  return candidates;
}


/**
 * Assigns brutalist semantic component roles based on block geometry and position.
 */
function assignComponentType(
  block: GridBlock,
  index: number,
  total: number
): GridBlock['componentType'] {
  const { colSpan: w, rowSpan: h } = block;
  const area = w * h;
  const ratio = w / h;

  if (index === 0 && area >= 4) return 'hero';
  if (area >= 6) return 'hero';
  if (ratio >= 2.5) return 'metric';
  if (ratio >= 1.5 && area >= 3) return 'feature';
  if (ratio <= 0.6 && h >= 2) return 'article';
  if (area === 4 && w === 2 && h === 2) return index % 2 === 0 ? 'quote' : 'media';
  if (area === 2 && w === 2) return 'cta';
  if (area === 2 && h === 2) return 'tech';
  if (area === 1) return index % 2 === 0 ? 'avatar' : 'compact';

  return 'feature';
}

/**
 * 1. Gorilla Sun Pseudo-Rectangle Packing on a Boolean Grid
 */
export function runGorillaSunAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, gapStrategy, seed, allowedSpans } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];
  
  // Parse allowed spans and ensure resolution-friendly atomic fallbacks
  let candidates = parseAllowedSpans(allowedSpans);
  if (candidates.length === 0) {
    candidates = [{ w: 1, h: 1 }, { w: 2, h: 1 }, { w: 1, h: 2 }, { w: 2, h: 2 }];
  }

  // When rows <= 2, prioritize spans with h = 1 so the row division is clearly expressed
  if (rows <= 2) {
    candidates = candidates.filter(c => c.h <= 1 || (c.h <= rows && prng.next() < 0.25));
    if (!candidates.some(c => c.w === 1 && c.h === 1)) {
      candidates.push({ w: 1, h: 1 });
    }
  }

  // Ensure maximum colSpan and rowSpan do not engulf the entire canvas
  const effectiveMaxCol = Math.min(cols, config.maxColSpan || Math.max(1, Math.floor(cols * 0.5)));
  const effectiveMaxRow = Math.min(rows, config.maxRowSpan || (rows <= 2 ? 1 : Math.max(1, Math.floor(rows * 0.5))));

  steps.push({
    stepIndex: 0,
    action: 'init',
    currentCell: null,
    booleanGrid: cloneGrid(grid),
    placedBlocks: [],
    description: `Initialized ${cols}×${rows} Boolean matrix with 100% unoccupied state.`,
  });

  let blockOrder = 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) continue;

      const shuffled = prng.shuffle(candidates);
      let placed = false;
      for (const cand of shuffled) {
        const w = Math.min(cand.w, effectiveMaxCol, cols - x);
        const h = Math.min(cand.h, effectiveMaxRow, rows - y);
        if (w < 1 || h < 1) continue;

        const check = canPlaceRectangle(grid, x, y, w, h, cols, rows);
        if (check.valid) {
          markOccupied(grid, x, y, w, h);
          const block: GridBlock = {
            id: `gs-${blockOrder}-${x}-${y}`,
            col: x,
            row: y,
            colSpan: w,
            rowSpan: h,
            order: blockOrder,
            isGapFill: false,
            algorithmOrigin: 'gorilla-sun',
            componentType: assignComponentType({ id: '', col: x, row: y, colSpan: w, rowSpan: h, order: blockOrder }, blockOrder - 1, 0),
          };
          blocks.push(block);
          steps.push({
            stepIndex: steps.length,
            action: 'block-placed',
            currentCell: { x, y },
            candidateSpan: { w, h },
            booleanGrid: cloneGrid(grid),
            placedBlocks: [...blocks],
            description: `Placed Block #${blockOrder} at (${x}, ${y}) spanning ${w}×${h}.`,
          });
          blockOrder++;
          placed = true;
          break;
        }
      }

      // If no candidate fit, place an atomic 1x1 block
      if (!placed && grid[y][x]) {
        markOccupied(grid, x, y, 1, 1);
        blocks.push({
          id: `gs-${blockOrder}-${x}-${y}`,
          col: x,
          row: y,
          colSpan: 1,
          rowSpan: 1,
          order: blockOrder,
          isGapFill: false,
          algorithmOrigin: 'gorilla-sun',
        });
        blockOrder++;
      }
    }
  }

  // Leftover gap filling
  if (gapStrategy !== 'negative-space') {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!grid[y][x]) continue;

        markOccupied(grid, x, y, 1, 1);
        blocks.push({
          id: `gap-${blockOrder}-${x}-${y}`,
          col: x,
          row: y,
          colSpan: 1,
          rowSpan: 1,
          order: blockOrder,
          isGapFill: true,
          algorithmOrigin: 'gorilla-sun',
        });
        blockOrder++;
      }
    }
  }

  return { blocks, steps };
}

/**
 * 2. Recursive Binary Space Partitioning (BSP / Slicing Tree)
 */
export function runRecursiveBSPAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed, bspSplitVariance } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  interface RectNode {
    x: number;
    y: number;
    w: number;
    h: number;
    depth: number;
  }

  steps.push({
    stepIndex: 0,
    action: 'init',
    currentCell: null,
    booleanGrid: cloneGrid(grid),
    placedBlocks: [],
    description: `Initialized root BSP viewport node spanning [0..${cols}, 0..${rows}].`,
  });

  const queue: RectNode[] = [{ x: 0, y: 0, w: cols, h: rows, depth: 0 }];
  const leaves: RectNode[] = [];
  const resolutionDepth = Math.min(8, Math.max(3, Math.ceil(Math.log2(Math.max(cols, rows))) + 1));
  const maxDepth = config.bspDepth && config.bspDepth > 3 ? Math.min(8, config.bspDepth) : resolutionDepth;

  while (queue.length > 0) {
    const node = queue.shift()!;
    const minCol = Math.max(1, config.minColSpan || 1);
    const minRow = Math.max(1, config.minRowSpan || 1);
    const canSplitV = node.w >= 2 * minCol;
    const canSplitH = node.h >= 2 * minRow;

    // Granular target dimensions based on cols and rows
    const maxTargetW = Math.max(1, Math.min(cols > 4 ? 3 : 2, Math.ceil(cols / 4)));
    const maxTargetH = Math.max(1, Math.min(rows > 4 ? 2 : 1, Math.ceil(rows / 4)));
    const isOversized = node.w > maxTargetW || node.h > maxTargetH;

    const stopChance = node.depth >= 3 && !isOversized ? 0.2 + (node.depth / maxDepth) * 0.4 : 0;

    if ((node.depth >= maxDepth && !isOversized) || (!canSplitV && !canSplitH) || (prng.next() < stopChance && node.depth >= 3 && !isOversized)) {
      leaves.push(node);
      continue;
    }

    // Determine split direction: prioritize splitting full-height nodes so rows are articulated
    let splitVertical: boolean;
    if (canSplitV && !canSplitH) {
      splitVertical = true;
    } else if (!canSplitV && canSplitH) {
      splitVertical = false;
    } else if (node.h === rows && rows >= 2) {
      // If node still spans 100% of rows, prioritize horizontal cut to reveal rows
      splitVertical = prng.next() < 0.25;
    } else {
      splitVertical = node.w >= node.h ? prng.next() < 0.65 : prng.next() < 0.35;
    }

    const variance = bspSplitVariance || 0.2;

    if (splitVertical) {
      const minX = Math.max(1, config.minColSpan);
      const maxX = node.w - minX;
      if (maxX <= minX) {
        leaves.push(node);
        continue;
      }

      const mid = node.w * 0.5;
      const offset = (prng.next() - 0.5) * node.w * variance;
      const splitW = Math.max(minX, Math.min(maxX, Math.round(mid + offset)));

      queue.push({ x: node.x, y: node.y, w: splitW, h: node.h, depth: node.depth + 1 });
      queue.push({ x: node.x + splitW, y: node.y, w: node.w - splitW, h: node.h, depth: node.depth + 1 });

      steps.push({
        stepIndex: steps.length,
        action: 'bsp-split',
        currentCell: { x: node.x, y: node.y },
        candidateSpan: { w: node.w, h: node.h },
        booleanGrid: cloneGrid(grid),
        placedBlocks: [],
        description: `BSP Level ${node.depth}: Vertical partition of (${node.w}×${node.h}) into widths ${splitW} and ${node.w - splitW}.`,
      });
    } else {
      const minY = Math.max(1, config.minRowSpan);
      const maxY = node.h - minY;
      if (maxY <= minY) {
        leaves.push(node);
        continue;
      }

      const mid = node.h * 0.5;
      const offset = (prng.next() - 0.5) * node.h * variance;
      const splitH = Math.max(minY, Math.min(maxY, Math.round(mid + offset)));

      queue.push({ x: node.x, y: node.y, w: node.w, h: splitH, depth: node.depth + 1 });
      queue.push({ x: node.x, y: node.y + splitH, w: node.w, h: node.h - splitH, depth: node.depth + 1 });

      steps.push({
        stepIndex: steps.length,
        action: 'bsp-split',
        currentCell: { x: node.x, y: node.y },
        candidateSpan: { w: node.w, h: node.h },
        booleanGrid: cloneGrid(grid),
        placedBlocks: [],
        description: `BSP Level ${node.depth}: Horizontal partition of (${node.w}×${node.h}) into heights ${splitH} and ${node.h - splitH}.`,
      });
    }
  }

  // Convert terminal leaves into GridBlocks
  leaves.forEach((leaf, idx) => {
    markOccupied(grid, leaf.x, leaf.y, leaf.w, leaf.h);
    blocks.push({
      id: `bsp-${idx + 1}-${leaf.x}-${leaf.y}`,
      col: leaf.x,
      row: leaf.y,
      colSpan: leaf.w,
      rowSpan: leaf.h,
      order: idx + 1,
      isGapFill: false,
      algorithmOrigin: 'bsp',
      depth: leaf.depth,
      componentType: assignComponentType({ id: '', col: leaf.x, row: leaf.y, colSpan: leaf.w, rowSpan: leaf.h, order: idx + 1 }, idx, leaves.length),
    });
  });

  return { blocks, steps };
}

/**
 * 3. Karl Gerstner's Compound Modular Grid (Designing Programmes, 1964)
 * Overlays harmonic divisor ratios on a modular base that corresponds strictly to cols and rows.
 */
export function runKarlGerstnerAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  steps.push({
    stepIndex: 0,
    action: 'init',
    currentCell: null,
    booleanGrid: cloneGrid(grid),
    placedBlocks: [],
    description: `Initialized Gerstner Compound Grid framework across ${cols} columns and ${rows} rows.`,
  });

  let currentY = 0;
  let blockOrder = 1;

  // Gerstner compound band combinations that sum to cols with fine-grained modular balance
  const generateHarmonicRow = (availableCols: number): number[] => {
    const rowSpans: number[] = [];
    let remaining = availableCols;

    // Determine modular unit steps: for cols=12, candidate units are 1, 2, 3, 4
    const maxUnit = Math.max(1, Math.min(4, Math.floor(availableCols / 3)));
    const options = [1, 2, Math.min(3, maxUnit), maxUnit].filter(u => u >= 1);

    while (remaining > 0) {
      if (remaining <= 2) {
        rowSpans.push(remaining);
        break;
      }
      const valid = options.filter(u => u <= remaining);
      const chosen = valid.length > 0 ? prng.pick(valid) : remaining;
      rowSpans.push(chosen);
      remaining -= chosen;
    }
    return rowSpans;
  };

  while (currentY < rows) {
    const remainingH = rows - currentY;
    let bandH: number;
    if (rows <= 2) {
      bandH = 1; // Strict 1-row bands when rows <= 2 to preserve row structure
    } else if (remainingH <= 2) {
      bandH = 1;
    } else {
      const maxBandH = Math.min(remainingH, Math.max(1, Math.floor(rows / 3)));
      const options = [1, 1, 2, maxBandH].filter((h) => h <= maxBandH);
      bandH = prng.pick(options.length > 0 ? options : [1]);
    }

    const colSpans = generateHarmonicRow(cols);
    let currentX = 0;

    for (const spanW of colSpans) {
      markOccupied(grid, currentX, currentY, spanW, bandH);
      const block: GridBlock = {
        id: `gerstner-${blockOrder}-${currentX}-${currentY}`,
        col: currentX,
        row: currentY,
        colSpan: spanW,
        rowSpan: bandH,
        order: blockOrder,
        isGapFill: false,
        algorithmOrigin: 'gerstner',
        componentType: assignComponentType({ id: '', col: currentX, row: currentY, colSpan: spanW, rowSpan: bandH, order: blockOrder }, blockOrder - 1, 0),
      };
      blocks.push(block);

      steps.push({
        stepIndex: steps.length,
        action: 'block-placed',
        currentCell: { x: currentX, y: currentY },
        candidateSpan: { w: spanW, h: bandH },
        booleanGrid: cloneGrid(grid),
        placedBlocks: [...blocks],
        description: `Placed Gerstner harmonic module #${blockOrder} (${spanW}×${bandH}) at col ${currentX}, row ${currentY}.`,
      });

      blockOrder++;
      currentX += spanW;
    }

    currentY += bandH;
  }

  return { blocks, steps };
}

/**
 * 4. Golden Ratio / Logarithmic Fibonacci Spiral Partitioning (phi ~ 1.618)
 * Iteratively carves out dominant golden quadrants in a rotational spiral.
 */
export function runFibonacciPartitioning(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  let box = { x: 0, y: 0, w: cols, h: rows };
  let direction = 0; // 0: Left, 1: Top, 2: Right, 3: Bottom
  let order = 1;

  steps.push({
    stepIndex: 0,
    action: 'init',
    currentCell: null,
    booleanGrid: cloneGrid(grid),
    placedBlocks: [],
    description: `Starting Fibonacci Golden Spiral dissection on viewport (${cols}×${rows}).`,
  });

  const phi = 0.6180339887; // Golden ratio reciprocal

  while (box.w >= 2 && box.h >= 1 && order <= 10) {
    let carveW = 0;
    let carveH = 0;
    let carveX = box.x;
    let carveY = box.y;

    if (direction === 0) {
      // Carve from Left
      carveW = Math.max(1, Math.min(box.w - 1, Math.round(box.w * (1 - phi))));
      carveH = rows <= 2 ? 1 : box.h;
      carveX = box.x;
      carveY = box.y;
      box = { x: box.x + carveW, y: box.y, w: box.w - carveW, h: box.h };
    } else if (direction === 1) {
      // Carve from Top
      carveW = box.w;
      carveH = rows <= 2 ? 1 : Math.max(1, Math.min(box.h - 1, Math.round(box.h * (1 - phi))));
      carveX = box.x;
      carveY = box.y;
      box = { x: box.x, y: box.y + carveH, w: box.w, h: box.h - carveH };
    } else if (direction === 2) {
      // Carve from Right
      carveW = Math.max(1, Math.min(box.w - 1, Math.round(box.w * (1 - phi))));
      carveH = rows <= 2 ? 1 : box.h;
      carveX = box.x + (box.w - carveW);
      carveY = box.y;
      box = { x: box.x, y: box.y, w: box.w - carveW, h: box.h };
    } else {
      // Carve from Bottom
      carveW = box.w;
      carveH = rows <= 2 ? 1 : Math.max(1, Math.min(box.h - 1, Math.round(box.h * (1 - phi))));
      carveX = box.x;
      carveY = box.y + (box.h - carveH);
      box = { x: box.x, y: box.y, w: box.w, h: box.h - carveH };
    }

    if (carveW > 0 && carveH > 0) {
      markOccupied(grid, carveX, carveY, carveW, carveH);
      blocks.push({
        id: `fibo-${order}-${carveX}-${carveY}`,
        col: carveX,
        row: carveY,
        colSpan: carveW,
        rowSpan: carveH,
        order,
        isGapFill: false,
        algorithmOrigin: 'fibonacci',
        componentType: assignComponentType({ id: '', col: carveX, row: carveY, colSpan: carveW, rowSpan: carveH, order }, order - 1, 0),
      });

      steps.push({
        stepIndex: steps.length,
        action: 'fibonacci-carve',
        currentCell: { x: carveX, y: carveY },
        candidateSpan: { w: carveW, h: carveH },
        booleanGrid: cloneGrid(grid),
        placedBlocks: [...blocks],
        description: `Fibonacci step #${order}: Carved golden quadrant (${carveW}×${carveH}) along edge ${direction}.`,
      });

      order++;
    }
    direction = (direction + 1) % 4;
  }

  // Fill leftover core cells cleanly
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) continue;
      markOccupied(grid, x, y, 1, 1);
      blocks.push({
        id: `fibo-core-${x}-${y}`,
        col: x,
        row: y,
        colSpan: 1,
        rowSpan: 1,
        order,
        isGapFill: false,
        algorithmOrigin: 'fibonacci',
      });
      order++;
    }
  }

  return { blocks, steps };
}

/**
 * 5. Asymmetric Focal Hero Anchor Partitioning
 * Places an intentional flagship anchor module at a focal locus, then directionally
 * partitions the remaining peripheral quadrants across columns and rows.
 */
export function runHeroAnchorAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed, focalLocus } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  // Hero dimensions: scaled to preserve surrounding column & row matrix
  const heroW = Math.max(1, Math.min(Math.max(1, cols - 2), Math.round(cols * 0.5)));
  const heroH = rows <= 2 ? 1 : Math.max(1, Math.min(rows - 1, Math.round(rows * 0.5)));

  let heroX = 0;
  let heroY = 0;

  if (focalLocus === 'top-right') {
    heroX = cols - heroW;
    heroY = 0;
  } else if (focalLocus === 'center') {
    heroX = Math.floor((cols - heroW) / 2);
    heroY = Math.floor((rows - heroH) / 2);
  } else if (focalLocus === 'bottom-left') {
    heroX = 0;
    heroY = rows - heroH;
  }

  // Place focal anchor block first
  markOccupied(grid, heroX, heroY, heroW, heroH);
  blocks.push({
    id: `anchor-hero-${heroX}-${heroY}`,
    col: heroX,
    row: heroY,
    colSpan: heroW,
    rowSpan: heroH,
    order: 1,
    isGapFill: false,
    algorithmOrigin: 'hero-anchor',
    componentType: 'hero',
  });

  steps.push({
    stepIndex: 0,
    action: 'block-placed',
    currentCell: { x: heroX, y: heroY },
    candidateSpan: { w: heroW, h: heroH },
    booleanGrid: cloneGrid(grid),
    placedBlocks: [...blocks],
    description: `Established primary Hero Anchor (${heroW}×${heroH}) at ${focalLocus} locus.`,
  });

  let blockOrder = 2;

  // Distribute secondary & tertiary modules in remaining free cells
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) continue;

      // Find max free horizontal stretch
      let maxW = 0;
      while (x + maxW < cols && grid[y][x + maxW]) {
        maxW++;
      }

      // Find max free vertical stretch
      let maxH = 0;
      let canGrowH = true;
      while (y + maxH < rows && canGrowH) {
        for (let i = 0; i < maxW; i++) {
          if (!grid[y + maxH][x + i]) {
            canGrowH = false;
            break;
          }
        }
        if (canGrowH) maxH++;
      }

      // Subdivide horizontally and vertically so columns and rows are articulated
      const spanW = Math.max(1, Math.min(maxW, prng.pick([1, 1, 2, 2, Math.min(3, maxW)])));
      const spanH = rows <= 2 ? 1 : Math.max(1, Math.min(maxH, prng.pick([1, 1, 2])));

      markOccupied(grid, x, y, spanW, spanH);
      blocks.push({
        id: `anchor-sub-${blockOrder}-${x}-${y}`,
        col: x,
        row: y,
        colSpan: spanW,
        rowSpan: spanH,
        order: blockOrder,
        isGapFill: false,
        algorithmOrigin: 'hero-anchor',
        componentType: assignComponentType({ id: '', col: x, row: y, colSpan: spanW, rowSpan: spanH, order: blockOrder }, blockOrder - 1, 0),
      });

      blockOrder++;
    }
  }

  return { blocks, steps };
}

/**
 * 6. Guillotine Cut / Shelf Packing Algorithm
 */
export function runGuillotineAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  let currentY = 0;
  let order = 1;

  while (currentY < rows) {
    const shelfH = rows <= 2 ? 1 : Math.min(rows - currentY, prng.pick([1, 1, 2, Math.max(1, Math.floor(rows / 3))]));
    let currentX = 0;

    while (currentX < cols) {
      const remainingW = cols - currentX;
      const maxBlockW = Math.max(1, Math.min(remainingW, Math.max(2, Math.floor(cols / 4))));
      const blockW = prng.pick([1, 2, Math.min(3, maxBlockW), maxBlockW]);

      markOccupied(grid, currentX, currentY, blockW, shelfH);
      blocks.push({
        id: `guillotine-${order}-${currentX}-${currentY}`,
        col: currentX,
        row: currentY,
        colSpan: blockW,
        rowSpan: shelfH,
        order,
        isGapFill: false,
        algorithmOrigin: 'guillotine',
        componentType: assignComponentType({ id: '', col: currentX, row: currentY, colSpan: blockW, rowSpan: shelfH, order }, order - 1, 0),
      });
      order++;
      currentX += blockW;
    }
    currentY += shelfH;
  }

  return { blocks, steps };
}

/**
 * 7. De Stijl Mondrian Orthogonal Dissection
 * Divides canvas with asymmetric dominant structural axes, generating
 * iconic Piet Mondrian balance of monolithic fields and compact counterweights.
 */
export function runMondrianAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  steps.push({
    stepIndex: 0,
    action: 'init',
    currentCell: null,
    booleanGrid: cloneGrid(grid),
    placedBlocks: [],
    description: `Initialized De Stijl Neoplastic matrix (${cols}×${rows}).`,
  });

  const targetVCutCount = Math.max(2, Math.min(cols - 1, Math.floor(cols / 2.5)));
  const vCutsSet = new Set<number>([0, cols]);
  for (let i = 0; i < targetVCutCount; i++) {
    const cut = 1 + Math.floor(prng.next() * (cols - 1));
    vCutsSet.add(cut);
  }
  const vCuts = Array.from(vCutsSet).sort((a, b) => a - b);

  const targetHCutCount = Math.max(1, Math.min(rows - 1, Math.floor(rows / 2)));
  const hCutsSet = new Set<number>([0, rows]);
  for (let i = 0; i < targetHCutCount; i++) {
    const cut = 1 + Math.floor(prng.next() * (rows - 1));
    hCutsSet.add(cut);
  }
  const hCuts = Array.from(hCutsSet).sort((a, b) => a - b);

  let order = 1;

  for (let r = 0; r < hCuts.length - 1; r++) {
    const y0 = hCuts[r];
    const y1 = hCuts[r + 1];
    const cellH = y1 - y0;

    for (let c = 0; c < vCuts.length - 1; c++) {
      const x0 = vCuts[c];
      const x1 = vCuts[c + 1];
      const cellW = x1 - x0;

      // When cell is oversized relative to cols or rows, always subdivide
      const isOversized = cellW > Math.max(2, Math.floor(cols / 3)) || (rows > 2 && cellH > Math.max(2, Math.floor(rows / 3)));
      const shouldSubdivide = (cellW >= 2 || cellH >= 2) && (isOversized || prng.next() > 0.4);

      if (!shouldSubdivide) {
        markOccupied(grid, x0, y0, cellW, cellH);
        blocks.push({
          id: `mondrian-${order}-${x0}-${y0}`,
          col: x0,
          row: y0,
          colSpan: cellW,
          rowSpan: cellH,
          order,
          isGapFill: false,
          algorithmOrigin: 'mondrian',
          componentType: cellW * cellH >= 8 ? 'hero' : 'feature',
        });
        order++;
      } else {
        if (cellW >= 2 && (cellW >= cellH || cellH < 2)) {
          const splitX = Math.max(1, Math.round(cellW * 0.5));
          markOccupied(grid, x0, y0, splitX, cellH);
          blocks.push({
            id: `mondrian-${order}-${x0}-${y0}`,
            col: x0,
            row: y0,
            colSpan: splitX,
            rowSpan: cellH,
            order,
            isGapFill: false,
            algorithmOrigin: 'mondrian',
          });
          order++;

          markOccupied(grid, x0 + splitX, y0, cellW - splitX, cellH);
          blocks.push({
            id: `mondrian-${order}-${x0 + splitX}-${y0}`,
            col: x0 + splitX,
            row: y0,
            colSpan: cellW - splitX,
            rowSpan: cellH,
            order,
            isGapFill: false,
            algorithmOrigin: 'mondrian',
          });
          order++;
        } else {
          const splitY = Math.max(1, Math.round(cellH * 0.5));
          markOccupied(grid, x0, y0, cellW, splitY);
          blocks.push({
            id: `mondrian-${order}-${x0}-${y0}`,
            col: x0,
            row: y0,
            colSpan: cellW,
            rowSpan: splitY,
            order,
            isGapFill: false,
            algorithmOrigin: 'mondrian',
          });
          order++;

          markOccupied(grid, x0, y0 + splitY, cellW, cellH - splitY);
          blocks.push({
            id: `mondrian-${order}-${x0}-${y0 + splitY}`,
            col: x0,
            row: y0 + splitY,
            colSpan: cellW,
            rowSpan: cellH - splitY,
            order,
            isGapFill: false,
            algorithmOrigin: 'mondrian',
          });
          order++;
        }
      }
    }
  }

  return { blocks, steps };
}

/**
 * 8. Adaptive Quadtree Subdivision
 * Recursively splits rectangular zones into quadrants with 1D fallback when one axis is atomic.
 */
export function runQuadtreeAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  interface QuadNode {
    x: number;
    y: number;
    w: number;
    h: number;
    depth: number;
  }

  const resolutionDepth = Math.min(6, Math.max(3, Math.ceil(Math.log2(Math.max(cols, rows)))));
  const maxDepth = Math.max(1, config.bspDepth && config.bspDepth > 3 ? config.bspDepth : resolutionDepth);
  const queue: QuadNode[] = [{ x: 0, y: 0, w: cols, h: rows, depth: 0 }];
  const leaves: QuadNode[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    const canSplit2D = node.w >= 2 && node.h >= 2 && node.depth < maxDepth;
    const canSplitW = node.w >= 2 && node.depth < maxDepth;
    const canSplitH = node.h >= 2 && node.depth < maxDepth;

    const isOversized = node.w > Math.max(2, Math.floor(cols / 4)) || node.h > Math.max(2, Math.floor(rows / 4));
    const stopProbability = node.depth === 0 ? 0 : isOversized ? 0 : 0.15 + (node.depth / maxDepth) * 0.35;

    if ((!canSplitW && !canSplitH) || (node.depth >= maxDepth && !isOversized) || (prng.next() < stopProbability && node.depth >= 2 && !isOversized)) {
      leaves.push(node);
      continue;
    }

    if (canSplit2D) {
      const midW = Math.max(1, Math.round(node.w * 0.5));
      const midH = Math.max(1, Math.round(node.h * 0.5));
      const rightW = node.w - midW;
      const botH = node.h - midH;

      queue.push({ x: node.x, y: node.y, w: midW, h: midH, depth: node.depth + 1 });
      queue.push({ x: node.x + midW, y: node.y, w: rightW, h: midH, depth: node.depth + 1 });
      queue.push({ x: node.x, y: node.y + midH, w: midW, h: botH, depth: node.depth + 1 });
      queue.push({ x: node.x + midW, y: node.y + midH, w: rightW, h: botH, depth: node.depth + 1 });
    } else if (canSplitW) {
      const midW = Math.max(1, Math.round(node.w * 0.5));
      queue.push({ x: node.x, y: node.y, w: midW, h: node.h, depth: node.depth + 1 });
      queue.push({ x: node.x + midW, y: node.y, w: node.w - midW, h: node.h, depth: node.depth + 1 });
    } else if (canSplitH) {
      const midH = Math.max(1, Math.round(node.h * 0.5));
      queue.push({ x: node.x, y: node.y, w: node.w, h: midH, depth: node.depth + 1 });
      queue.push({ x: node.x, y: node.y + midH, w: node.w, h: node.h - midH, depth: node.depth + 1 });
    } else {
      leaves.push(node);
    }
  }

  leaves.forEach((leaf, idx) => {
    markOccupied(grid, leaf.x, leaf.y, leaf.w, leaf.h);
    blocks.push({
      id: `quad-${idx + 1}-${leaf.x}-${leaf.y}`,
      col: leaf.x,
      row: leaf.y,
      colSpan: leaf.w,
      rowSpan: leaf.h,
      order: idx + 1,
      isGapFill: false,
      algorithmOrigin: 'quadtree-recursive',
      depth: leaf.depth,
      componentType: assignComponentType({ id: '', col: leaf.x, row: leaf.y, colSpan: leaf.w, rowSpan: leaf.h, order: idx + 1 }, idx, leaves.length),
    });
  });

  return { blocks, steps };
}

/**
 * 9. Tessellated Masonry & Staggered Brickwork
 * Generates continuous running bonds with horizontal phase shifts scaled to cols.
 */
export function runStaggeredBrickAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  let order = 1;

  for (let y = 0; y < rows; y++) {
    const isOdd = y % 2 === 1;
    let currentX = 0;

    if (isOdd && cols >= 4) {
      const offsetW = 1;
      markOccupied(grid, 0, y, offsetW, 1);
      blocks.push({
        id: `brick-${order}-0-${y}`,
        col: 0,
        row: y,
        colSpan: offsetW,
        rowSpan: 1,
        order,
        isGapFill: false,
        algorithmOrigin: 'staggered-brick',
      });
      order++;
      currentX = offsetW;
    }

    while (currentX < cols) {
      const remainingW = cols - currentX;
      const maxBrickW = Math.max(1, Math.min(remainingW, Math.max(2, Math.floor(cols / 4))));
      const w = prng.pick([1, 2, Math.min(3, maxBrickW), maxBrickW]);

      markOccupied(grid, currentX, y, w, 1);
      blocks.push({
        id: `brick-${order}-${currentX}-${y}`,
        col: currentX,
        row: y,
        colSpan: w,
        rowSpan: 1,
        order,
        isGapFill: false,
        algorithmOrigin: 'staggered-brick',
      });
      order++;
      currentX += w;
    }
  }

  return { blocks, steps };
}

/**
 * 10. Swiss Columnar Typographic System
 * Multi-column editorial grid supporting standardized headline, body, and marginalia spans.
 */
export function runSwissColumnarAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  let currentY = 0;
  let order = 1;

  // Hero band occupies 1 row when rows <= 2, preserving row rhythm
  const heroH = rows <= 2 ? 1 : Math.min(Math.max(1, Math.floor(rows / 4)), rows - 1);
  const heroW = cols >= 12 
    ? (prng.next() > 0.5 ? Math.round(cols * 0.5) : Math.round(cols * 0.67))
    : cols >= 8 
    ? (prng.next() > 0.4 ? cols : Math.round(cols * 0.75)) 
    : cols;
  markOccupied(grid, 0, 0, heroW, heroH);
  blocks.push({
    id: `swiss-${order}-0-0`,
    col: 0,
    row: 0,
    colSpan: heroW,
    rowSpan: heroH,
    order,
    isGapFill: false,
    algorithmOrigin: 'swiss-columnar',
    componentType: 'hero',
  });
  order++;

  if (heroW < cols) {
    const sideW = cols - heroW;
    markOccupied(grid, heroW, 0, sideW, heroH);
    blocks.push({
      id: `swiss-${order}-${heroW}-0`,
      col: heroW,
      row: 0,
      colSpan: sideW,
      rowSpan: heroH,
      order,
      isGapFill: false,
      algorithmOrigin: 'swiss-columnar',
      componentType: 'metric',
    });
    order++;
  }

  currentY += heroH;

  while (currentY < rows) {
    const remainingH = rows - currentY;
    const bandH = rows <= 2 ? 1 : Math.min(remainingH, prng.pick([1, 1, 2]));

    // Patterns reflect grid density
    const patternOptions: string[] = [];
    if (cols >= 12) {
      patternOptions.push('equal-12', 'equal-6', 'equal-4', 'equal-3', 'asym-3col');
    } else if (cols >= 8) {
      patternOptions.push('equal-8', 'equal-4', 'asym-left', 'asym-right');
    } else if (cols >= 6) {
      patternOptions.push('equal-6', 'equal-3', 'equal-2');
    } else if (cols >= 4) {
      patternOptions.push('equal-4', 'equal-2', 'asym-left', 'asym-right');
    } else if (cols >= 3) {
      patternOptions.push('equal-3', 'asym-left');
    } else {
      patternOptions.push('equal-2');
    }

    const pattern = prng.pick(patternOptions);
    let spans: number[] = [];

    if (pattern === 'equal-2' && cols >= 2) {
      const w1 = Math.floor(cols / 2);
      spans = [w1, cols - w1];
    } else if (pattern === 'equal-3' && cols >= 3) {
      const w1 = Math.floor(cols / 3);
      spans = [w1, w1, cols - 2 * w1];
    } else if (pattern === 'equal-4' && cols >= 4) {
      const w1 = Math.floor(cols / 4);
      spans = [w1, w1, w1, cols - 3 * w1];
    } else if (pattern === 'equal-6' && cols >= 6) {
      const w1 = Math.floor(cols / 6);
      spans = [w1, w1, w1, w1, w1, cols - 5 * w1];
    } else if (pattern === 'equal-8' && cols >= 8) {
      const w1 = Math.floor(cols / 8);
      spans = Array(7).fill(w1).concat([cols - 7 * w1]);
    } else if (pattern === 'equal-12' && cols >= 12) {
      const w1 = Math.floor(cols / 12);
      spans = Array(11).fill(w1).concat([cols - 11 * w1]);
    } else if (pattern === 'asym-3col' && cols >= 6) {
      const w1 = Math.floor(cols * 0.5);
      const w2 = Math.floor((cols - w1) * 0.5);
      spans = [w1, w2, cols - w1 - w2];
    } else if (pattern === 'asym-left' && cols >= 4) {
      const w1 = Math.max(1, Math.floor(cols * 0.35));
      spans = [w1, cols - w1];
    } else if (pattern === 'asym-right' && cols >= 4) {
      const w1 = Math.max(1, Math.floor(cols * 0.65));
      spans = [w1, cols - w1];
    } else {
      spans = [cols];
    }

    let curX = 0;
    for (const w of spans) {
      if (w <= 0) continue;
      markOccupied(grid, curX, currentY, w, bandH);
      blocks.push({
        id: `swiss-${order}-${curX}-${currentY}`,
        col: curX,
        row: currentY,
        colSpan: w,
        rowSpan: bandH,
        order,
        isGapFill: false,
        algorithmOrigin: 'swiss-columnar',
        componentType: w >= 4 ? 'feature' : 'compact',
      });
      order++;
      curX += w;
    }

    currentY += bandH;
  }

  return { blocks, steps };
}

/**
 * 11. Squarified Golden Treemap
 * Area-proportional space partitioning optimizing aspect ratios towards golden rectangles.
 */
export function runTreemapAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  const count = Math.max(6, Math.min(24, Math.round(cols * rows * 0.35)));
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    weights.push(Math.pow(0.85, i) * (0.8 + prng.next() * 0.4));
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const totalArea = cols * rows;

  let currentBox = { x: 0, y: 0, w: cols, h: rows };
  let order = 1;

  for (let i = 0; i < weights.length; i++) {
    if (currentBox.w <= 0 || currentBox.h <= 0) break;

    const proportion = weights[i] / totalWeight;
    const targetArea = Math.max(1, Math.round(proportion * totalArea * 1.2));

    const isWider = currentBox.w >= currentBox.h;

    let sliceW = 0;
    let sliceH = 0;

    if (rows <= 2) {
      sliceW = Math.max(1, Math.min(currentBox.w, Math.round(targetArea / currentBox.h)));
      sliceH = 1;
    } else if (isWider) {
      sliceW = Math.max(1, Math.min(currentBox.w, Math.round(targetArea / currentBox.h)));
      sliceH = Math.min(currentBox.h, Math.max(1, Math.floor(currentBox.h * 0.6)));
    } else {
      sliceW = Math.min(currentBox.w, Math.max(1, Math.floor(currentBox.w * 0.6)));
      sliceH = Math.max(1, Math.min(currentBox.h, Math.round(targetArea / currentBox.w)));
    }

    markOccupied(grid, currentBox.x, currentBox.y, sliceW, sliceH);
    blocks.push({
      id: `treemap-${order}-${currentBox.x}-${currentBox.y}`,
      col: currentBox.x,
      row: currentBox.y,
      colSpan: sliceW,
      rowSpan: sliceH,
      order,
      isGapFill: false,
      algorithmOrigin: 'treemap',
      componentType: sliceW * sliceH >= 6 ? 'hero' : 'feature',
    });
    order++;

    if (isWider) {
      currentBox = {
        x: currentBox.x + sliceW,
        y: currentBox.y,
        w: currentBox.w - sliceW,
        h: currentBox.h,
      };
    } else {
      currentBox = {
        x: currentBox.x,
        y: currentBox.y + sliceH,
        w: currentBox.w,
        h: currentBox.h - sliceH,
      };
    }
  }

  // Leftovers
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) continue;
      markOccupied(grid, x, y, 1, 1);
      blocks.push({
        id: `treemap-${order}-${x}-${y}`,
        col: x,
        row: y,
        colSpan: 1,
        rowSpan: 1,
        order,
        isGapFill: false,
        algorithmOrigin: 'treemap',
      });
      order++;
    }
  }

  return { blocks, steps };
}

/**
 * 12. Josef Müller-Brockmann Rational Modular Matrix
 * Systematic raster grid dividing the poster plane into uniform or harmonic modular fields.
 * Scales dynamically to reach all columns (up to 24) and rows (up to 24).
 */
export function runModularUniformAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
} {
  const { cols, rows, seed } = config;
  const prng = new PRNG(seed);
  const grid = createBooleanGrid(cols, rows);
  const blocks: GridBlock[] = [];
  const steps: AlgorithmicStep[] = [];

  steps.push({
    stepIndex: 0,
    action: 'init',
    currentCell: null,
    booleanGrid: cloneGrid(grid),
    placedBlocks: [],
    description: `Initialized Josef Müller-Brockmann Rational Modular Matrix (${cols}×${rows}).`,
  });

  let order = 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) continue;

      let spanW = 1;
      let spanH = 1;

      // Allow occasional composite modules while strictly preserving row separation when rows <= 2
      const can2x2 = rows > 2 && x + 1 < cols && y + 1 < rows && grid[y][x + 1] && grid[y + 1][x] && grid[y + 1][x + 1];
      const can2x1 = x + 1 < cols && grid[y][x + 1];

      if (can2x2 && prng.next() > 0.8) {
        spanW = 2;
        spanH = 2;
      } else if (can2x1 && prng.next() > 0.7) {
        spanW = 2;
        spanH = 1;
      }

      markOccupied(grid, x, y, spanW, spanH);
      blocks.push({
        id: `modular-${order}-${x}-${y}`,
        col: x,
        row: y,
        colSpan: spanW,
        rowSpan: spanH,
        order,
        isGapFill: false,
        algorithmOrigin: 'modular-uniform',
        componentType: assignComponentType({ id: '', col: x, row: y, colSpan: spanW, rowSpan: spanH, order }, order - 1, cols * rows),
      });
      order++;
    }
  }

  return { blocks, steps };
}

/**
 * Master dispatcher: generates grid according to selected algorithm.
 */
export function generateGridByAlgorithm(config: GridConfig): {
  blocks: GridBlock[];
  steps: AlgorithmicStep[];
  stats: GridStats;
  finalGrid: boolean[][];
} {
  let result: { blocks: GridBlock[]; steps: AlgorithmicStep[] };
  let algorithmName = '';
  let timeComplexity = '';

  switch (config.algorithm) {
    case 'modular-uniform':
      result = runModularUniformAlgorithm(config);
      algorithmName = 'Müller-Brockmann Rational Modular Matrix';
      timeComplexity = 'O(W × H)';
      break;
    case 'bsp':
      result = runRecursiveBSPAlgorithm(config);
      algorithmName = 'Recursive Binary Space Partitioning (BSP)';
      timeComplexity = 'O(N log N)';
      break;
    case 'gerstner':
      result = runKarlGerstnerAlgorithm(config);
      algorithmName = 'Karl Gerstner Compound Modular Grid';
      timeComplexity = 'O(W × H)';
      break;
    case 'fibonacci':
      result = runFibonacciPartitioning(config);
      algorithmName = 'Logarithmic Fibonacci Spiral Partitioning';
      timeComplexity = 'O(log(W × H))';
      break;
    case 'hero-anchor':
      result = runHeroAnchorAlgorithm(config);
      algorithmName = 'Asymmetric Focal Hero Anchor';
      timeComplexity = 'O(W × H)';
      break;
    case 'guillotine':
      result = runGuillotineAlgorithm(config);
      algorithmName = 'Guillotine Cut Shelf Packing';
      timeComplexity = 'O(N)';
      break;
    case 'mondrian':
      result = runMondrianAlgorithm(config);
      algorithmName = 'De Stijl Mondrian Orthogonal Dissection';
      timeComplexity = 'O(N log N)';
      break;
    case 'quadtree-recursive':
      result = runQuadtreeAlgorithm(config);
      algorithmName = 'Adaptive Quadtree Subdivision';
      timeComplexity = 'O(4^D)';
      break;
    case 'staggered-brick':
      result = runStaggeredBrickAlgorithm(config);
      algorithmName = 'Tessellated Masonry & Staggered Brickwork';
      timeComplexity = 'O(W × H)';
      break;
    case 'swiss-columnar':
      result = runSwissColumnarAlgorithm(config);
      algorithmName = 'Swiss Columnar Typographic System';
      timeComplexity = 'O(W × H)';
      break;
    case 'treemap':
      result = runTreemapAlgorithm(config);
      algorithmName = 'Squarified Golden Treemap';
      timeComplexity = 'O(N log N)';
      break;
    case 'gorilla-sun':
    default:
      result = runGorillaSunAlgorithm(config);
      algorithmName = 'Gorilla Sun Pseudo-Rectangle Packing';
      timeComplexity = 'O(W × H × (w × h))';
      break;
  }

  let { blocks, steps } = result;

  // Apply bilateral-x or radial symmetry if configured
  if (config.symmetryMode === 'bilateral-x' && config.cols >= 4) {
    const halfCols = Math.floor(config.cols / 2);
    const hasCenterSeam = config.cols % 2 === 1;
    const halfConfig: GridConfig = {
      ...config,
      cols: halfCols,
      maxColSpan: Math.min(config.maxColSpan, halfCols),
      symmetryMode: 'none',
    };
    const leftResult = generateGridByAlgorithm(halfConfig);
    const symBlocks: GridBlock[] = [];
    let order = 1;
    for (const lb of leftResult.blocks) {
      symBlocks.push({
        ...lb,
        id: `sym-L-${order}-${lb.col}-${lb.row}`,
        order: order++,
      });
    }
    if (hasCenterSeam) {
      const centerCol = halfCols;
      symBlocks.push({
        id: `sym-C-${order}-${centerCol}-0`,
        col: centerCol,
        row: 0,
        colSpan: 1,
        rowSpan: config.rows,
        order: order++,
        algorithmOrigin: config.algorithm,
        componentType: 'feature',
      });
    }
    for (const lb of leftResult.blocks) {
      const mirroredCol = config.cols - lb.col - lb.colSpan;
      symBlocks.push({
        ...lb,
        id: `sym-R-${order}-${mirroredCol}-${lb.row}`,
        col: mirroredCol,
        order: order++,
      });
    }
    blocks = symBlocks;
  } else if (config.symmetryMode === 'radial' && config.cols >= 4 && config.rows >= 4) {
    const halfCols = Math.floor(config.cols / 2);
    const halfRows = Math.floor(config.rows / 2);
    const quadConfig: GridConfig = {
      ...config,
      cols: halfCols,
      rows: halfRows,
      maxColSpan: Math.min(config.maxColSpan, halfCols),
      maxRowSpan: Math.min(config.maxRowSpan, halfRows),
      symmetryMode: 'none',
    };
    const quadResult = generateGridByAlgorithm(quadConfig);
    const radBlocks: GridBlock[] = [];
    let order = 1;
    const rightOffset = config.cols - halfCols;
    const bottomOffset = config.rows - halfRows;

    // NW quadrant
    for (const qb of quadResult.blocks) {
      radBlocks.push({
        ...qb,
        id: `rad-NW-${order}-${qb.col}-${qb.row}`,
        order: order++,
      });
    }
    // NE quadrant (mirrored horizontally)
    for (const qb of quadResult.blocks) {
      const c = rightOffset + (halfCols - qb.col - qb.colSpan);
      radBlocks.push({
        ...qb,
        id: `rad-NE-${order}-${c}-${qb.row}`,
        col: c,
        order: order++,
      });
    }
    // SW quadrant (mirrored vertically)
    for (const qb of quadResult.blocks) {
      const r = bottomOffset + (halfRows - qb.row - qb.rowSpan);
      radBlocks.push({
        ...qb,
        id: `rad-SW-${order}-${qb.col}-${r}`,
        row: r,
        order: order++,
      });
    }
    // SE quadrant (mirrored both axes)
    for (const qb of quadResult.blocks) {
      const c = rightOffset + (halfCols - qb.col - qb.colSpan);
      const r = bottomOffset + (halfRows - qb.row - qb.rowSpan);
      radBlocks.push({
        ...qb,
        id: `rad-SE-${order}-${c}-${r}`,
        col: c,
        row: r,
        order: order++,
      });
    }
    // Fill any odd center column/row seam
    if (config.cols % 2 === 1) {
      radBlocks.push({
        id: `rad-axis-x-${order}`,
        col: halfCols,
        row: 0,
        colSpan: 1,
        rowSpan: config.rows,
        order: order++,
        algorithmOrigin: config.algorithm,
      });
    } else if (config.rows % 2 === 1) {
      radBlocks.push({
        id: `rad-axis-y-${order}`,
        col: 0,
        row: halfRows,
        colSpan: config.cols,
        rowSpan: 1,
        order: order++,
        algorithmOrigin: config.algorithm,
      });
    }
    blocks = radBlocks;
  }

  // Process void density if set
  if (config.voidDensity && config.voidDensity > 0) {
    const prng = new PRNG(config.seed + 9999);
    blocks.forEach((block) => {
      if (prng.next() < config.voidDensity! && block.componentType !== 'hero') {
        block.customStyle = {
          ...(block.customStyle || {}),
          isNegativeVoid: true,
        };
      }
    });
  }

  // Assign component roles
  blocks.forEach((block, idx) => {
    if (!block.componentType) {
      block.componentType = assignComponentType(block, idx, blocks.length);
    }
  });

  const totalCells = config.cols * config.rows;
  let occupiedCells = 0;
  let maxArea = 0;
  let largest = { w: 1, h: 1 };
  let sumCol = 0;
  let sumRow = 0;
  let gapFillsCount = 0;

  for (const b of blocks) {
    const area = b.colSpan * b.rowSpan;
    occupiedCells += area;
    sumCol += b.colSpan;
    sumRow += b.rowSpan;
    if (b.isGapFill) gapFillsCount++;
    if (area > maxArea) {
      maxArea = area;
      largest = { w: b.colSpan, h: b.rowSpan };
    }
  }

  const stats: GridStats = {
    algorithmName,
    totalCells,
    occupiedCells,
    fillPercentage: Math.round((occupiedCells / totalCells) * 100),
    blockCount: blocks.length,
    avgColSpan: Number((sumCol / (blocks.length || 1)).toFixed(1)),
    avgRowSpan: Number((sumRow / (blocks.length || 1)).toFixed(1)),
    gapFillsCount,
    primaryBlocksCount: blocks.length - gapFillsCount,
    largestBlock: largest,
    timeComplexity,
  };

  return {
    blocks,
    steps,
    stats,
    finalGrid: steps[steps.length - 1]?.booleanGrid || createBooleanGrid(config.cols, config.rows),
  };
}
