/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toPng, toCanvas } from 'html-to-image';
import { BoxCustomStyle, GridBlock, GridConfig, PosterConfig } from '../types/grid';
import { generateSVG } from './codeGenerators';

export interface PngExportOptions {
  pixelRatio?: number;
  quality?: number;
  backgroundColor?: string;
  onProgress?: (status: string) => void;
}

export interface WebpExportOptions {
  pixelRatio?: number;
  quality?: number; // 0.1 to 1.0 (default 0.92)
  backgroundColor?: string;
  onProgress?: (status: string) => void;
}

/**
 * Filter function to exclude temporary export overlays and guides.
 */
const exportNodeFilter = (node: Node): boolean => {
  if (node instanceof HTMLElement) {
    if (
      node.classList.contains('export-exclude') ||
      (node.classList.contains('pointer-events-none') && node.classList.contains('z-30'))
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Captures the grid canvas element as a high-resolution PNG Data URL.
 */
export async function exportPosterAsPngDataUrl(
  nodeId: string = 'poster-artwork-node',
  options: PngExportOptions = {},
  fallbackContext?: {
    blocks: GridBlock[];
    config: GridConfig;
    posterConfig: PosterConfig;
    boxStyles?: Record<string, BoxCustomStyle>;
  }
): Promise<string> {
  const pixelRatio = options.pixelRatio || 2;
  const targetNode = document.getElementById(nodeId);

  if (targetNode) {
    try {
      options.onProgress?.('Rendering DOM grid layers...');

      const dataUrl = await toPng(targetNode, {
        pixelRatio,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        backgroundColor: options.backgroundColor,
        filter: exportNodeFilter,
      });

      return dataUrl;
    } catch (err) {
      console.warn('DOM toPng failed, falling back to SVG rasterization:', err);
    }
  }

  if (fallbackContext) {
    options.onProgress?.('Rendering vector SVG to raster canvas...');
    return rasterizeSvgToPng(
      fallbackContext.blocks,
      fallbackContext.config,
      fallbackContext.posterConfig,
      fallbackContext.boxStyles,
      pixelRatio
    );
  }

  throw new Error('Grid artwork node not found and no fallback context provided.');
}

/**
 * Fallback rasterizer: takes the generated SVG and draws it onto an HTML5 Canvas.
 */
export function rasterizeSvgToPng(
  blocks: GridBlock[],
  config: GridConfig,
  posterConfig: PosterConfig,
  boxStyles?: Record<string, BoxCustomStyle>,
  pixelRatio: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const svgString = generateSVG(blocks, config, posterConfig, boxStyles);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL_API = window.URL || window.webkitURL || window;
      const blobUrl = URL_API.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * pixelRatio;
        canvas.height = img.height * pixelRatio;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL_API.revokeObjectURL(blobUrl);
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(pixelRatio, pixelRatio);
        ctx.drawImage(img, 0, 0);

        URL_API.revokeObjectURL(blobUrl);
        const pngUrl = canvas.toDataURL('image/png', 1.0);
        resolve(pngUrl);
      };

      img.onerror = (e) => {
        URL_API.revokeObjectURL(blobUrl);
        reject(new Error(`Failed to load SVG for rasterization: ${e}`));
      };

      img.src = blobUrl;
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Triggers browser download of a PNG data URL.
 */
export function downloadPngFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies a PNG Data URL to the user's system clipboard as a binary image.
 */
export async function copyPngToClipboard(dataUrl: string): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch (err) {
    console.warn('Failed to copy PNG image to clipboard:', err);
    return false;
  }
}

/**
 * Captures the grid canvas element as a high-resolution WebP Data URL.
 */
export async function exportPosterAsWebpDataUrl(
  nodeId: string = 'poster-artwork-node',
  options: WebpExportOptions = {},
  fallbackContext?: {
    blocks: GridBlock[];
    config: GridConfig;
    posterConfig: PosterConfig;
    boxStyles?: Record<string, BoxCustomStyle>;
  }
): Promise<string> {
  const pixelRatio = options.pixelRatio || 2;
  const quality = options.quality ?? 0.92;
  const targetNode = document.getElementById(nodeId);

  if (targetNode) {
    try {
      options.onProgress?.('Rendering DOM canvas layers for WebP...');
      const canvas = await toCanvas(targetNode, {
        pixelRatio,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        backgroundColor: options.backgroundColor,
        filter: exportNodeFilter,
      });

      return canvas.toDataURL('image/webp', quality);
    } catch (err) {
      console.warn('DOM toCanvas for WebP failed, falling back to SVG rasterization:', err);
    }
  }

  if (fallbackContext) {
    options.onProgress?.('Rasterizing SVG vector to WebP canvas...');
    const pngData = await rasterizeSvgToPng(
      fallbackContext.blocks,
      fallbackContext.config,
      fallbackContext.posterConfig,
      fallbackContext.boxStyles,
      pixelRatio
    );
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/webp', quality));
      };
      img.src = pngData;
    });
  }

  throw new Error('Grid artwork node not found and no fallback context provided.');
}

/**
 * Triggers browser download of a WebP data URL.
 */
export function downloadWebpFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.webp') ? filename : `${filename}.webp`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies a WebP Data URL to the user's system clipboard.
 */
export async function copyWebpToClipboard(dataUrl: string): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/webp': blob }),
      ]);
      return true;
    } catch {
      const img = new Image();
      return new Promise<boolean>((resolve) => {
        img.onload = async () => {
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d');
          if (!ctx) return resolve(false);
          ctx.drawImage(img, 0, 0);
          c.toBlob(async (pngBlob) => {
            if (!pngBlob) return resolve(false);
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': pngBlob }),
              ]);
              resolve(true);
            } catch {
              resolve(false);
            }
          }, 'image/png');
        };
        img.onerror = () => resolve(false);
        img.src = dataUrl;
      });
    }
  } catch (err) {
    console.warn('Failed to copy WebP image to clipboard:', err);
    return false;
  }
}
