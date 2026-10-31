/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoxCustomStyle, ContainerColorConfig, GridBlock, GridConfig } from '../types/grid';
import { getColorScheme, DEFAULT_COLOR_SCHEME_ID } from '../data/colorSchemes';

export interface ResolvedContainerFill {
  background: string; // CSS background value (e.g. '#008080' or 'linear-gradient(...)')
  svgFill: string; // e.g. '#008080' or 'url(#grad-block-1)'
  svgGradientDef?: string; // SVG <defs> gradient markup if gradient mode
  color1: string;
  color2?: string;
  isGradient: boolean;
}

export const DEFAULT_COLOR_CONFIG: ContainerColorConfig = {
  fillMode: 'palette-solid',
  schemeId: DEFAULT_COLOR_SCHEME_ID,
  gradientDirection: 'to-bottom-right',
  gradientStopOffset: 100,
  paletteDistribution: 'random',
  opacity: 1.0,
  seedOffset: 0,
  containerShadowStyle: 'brutalist-hard',
};

/**
 * Resolves the color or gradient for a grid container strictly within its boundary.
 */
export function resolveContainerFill(
  block: GridBlock,
  config: GridConfig,
  colorConfig: ContainerColorConfig = DEFAULT_COLOR_CONFIG,
  customStyle?: BoxCustomStyle,
  uniquePrefix: string = 'grid-grad'
): ResolvedContainerFill {
  if (customStyle?.isNegativeVoid) {
    return {
      background: 'transparent',
      svgFill: 'none',
      color1: 'transparent',
      isGradient: false,
    };
  }

  // 1. None / Wireframe mode
  if (colorConfig.fillMode === 'none' && !customStyle?.fillColor && !customStyle?.gradientColor1) {
    return {
      background: '#F8F8F8',
      svgFill: '#F8F8F8',
      color1: '#F8F8F8',
      isGradient: false,
    };
  }

  const scheme = getColorScheme(colorConfig.schemeId || DEFAULT_COLOR_SCHEME_ID);
  const palette = colorConfig.invertScheme ? [...scheme.colors].reverse() : scheme.colors;
  const count = palette.length;

  // Determine index in palette based on distribution strategy
  let baseIndex = 0;
  const seed = (config.seed || 1024) + (colorConfig.seedOffset || 0);

  switch (colorConfig.paletteDistribution) {
    case 'sequential':
      baseIndex = block.order % count;
      break;
    case 'coordinate-x':
      baseIndex = Math.floor((block.col / Math.max(1, config.cols)) * count) % count;
      break;
    case 'coordinate-y':
      baseIndex = Math.floor((block.row / Math.max(1, config.rows)) * count) % count;
      break;
    case 'size-based':
      baseIndex = (block.colSpan * block.rowSpan) % count;
      break;
    case 'random':
    default: {
      // Deterministic PRNG hash for consistent per-cell color across re-renders
      const n = (seed * 41 + block.col * 17 + block.row * 29 + block.order * 37 + (block.colSpan * 11) + (block.rowSpan * 7)) >>> 0;
      baseIndex = n % count;
      break;
    }
  }

  const color1 = customStyle?.fillColor || customStyle?.gradientColor1 || palette[baseIndex];
  const nextIndex = (baseIndex + 1) % count;
  const color2 =
    customStyle?.gradientColor2 ||
    palette[nextIndex === baseIndex ? (baseIndex + 2) % count : nextIndex];

  // 2. Gradient Fill mode
  if (colorConfig.fillMode === 'gradient' || customStyle?.gradientColor1) {
    const stop = colorConfig.gradientStopOffset ?? 100;
    const gradId = `${uniquePrefix}-${block.id}`;

    let cssGrad = '';
    let svgDef = '';

    switch (colorConfig.gradientDirection) {
      case 'to-bottom':
        cssGrad = `linear-gradient(180deg, ${color1} 0%, ${color2} ${stop}%)`;
        svgDef = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="${stop}%" stop-color="${color2}"/></linearGradient>`;
        break;
      case 'to-right':
        cssGrad = `linear-gradient(90deg, ${color1} 0%, ${color2} ${stop}%)`;
        svgDef = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${color1}"/><stop offset="${stop}%" stop-color="${color2}"/></linearGradient>`;
        break;
      case 'to-top-right':
        cssGrad = `linear-gradient(45deg, ${color1} 0%, ${color2} ${stop}%)`;
        svgDef = `<linearGradient id="${gradId}" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="${color1}"/><stop offset="${stop}%" stop-color="${color2}"/></linearGradient>`;
        break;
      case 'radial':
        cssGrad = `radial-gradient(circle at center, ${color1} 0%, ${color2} ${stop}%)`;
        svgDef = `<radialGradient id="${gradId}" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="${color1}"/><stop offset="${stop}%" stop-color="${color2}"/></radialGradient>`;
        break;
      case 'to-bottom-right':
      default:
        cssGrad = `linear-gradient(135deg, ${color1} 0%, ${color2} ${stop}%)`;
        svgDef = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="${stop}%" stop-color="${color2}"/></linearGradient>`;
        break;
    }

    return {
      background: cssGrad,
      svgFill: `url(#${gradId})`,
      svgGradientDef: svgDef,
      color1,
      color2,
      isGradient: true,
    };
  }

  // 3. Solid Palette Fill mode
  return {
    background: color1,
    svgFill: color1,
    color1,
    isGradient: false,
  };
}
