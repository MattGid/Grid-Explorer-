/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlgorithmicStep,
  BoxCustomStyle,
  GridBlock,
  GridConfig,
  PosterConfig,
} from '../types/grid';
import { resolveContainerFill } from '../utils/containerColorResolver';

interface PosterCanvasProps {
  blocks: GridBlock[];
  config: GridConfig;
  posterConfig: PosterConfig;
  boxStyles: Record<string, BoxCustomStyle>;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onSwapBlocks?: (sourceId: string, targetId: string) => void;
  onResizeBlock?: (id: string, colSpan: number, rowSpan: number) => void;
  onToggleBlockVoid?: (id: string) => void;
  onToggleBlockLock?: (id: string) => void;
  zoom?: number;
  panOffset?: { x: number; y: number };
  isSpacePanning?: boolean;
  onCanvasWheel?: (e: React.WheelEvent) => void;
  onCanvasPanStart?: (e: React.MouseEvent) => void;
  theme?: 'light' | 'dark';
  activeStep?: AlgorithmicStep | null;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  blocks,
  config,
  posterConfig,
  boxStyles,
  selectedBlockId,
  onSelectBlock,
  onSwapBlocks,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
  isSpacePanning = false,
  onCanvasWheel,
  onCanvasPanStart,
  activeStep = null,
}) => {
  const { cols, rows, gap, borderRadius } = config;
  const {
    aspectRatio,
    paperOrientation = 'landscape',
    marginPadding,
    showGridGuides = true,
    showCrosshairs = false,
    showGridLines = true,
    gridBorderWidth = 1.5,
  } = posterConfig;

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const displayedBlocks = activeStep ? activeStep.placedBlocks : blocks;
  const isFillViewport = aspectRatio === 'fill-viewport';

  const getBaseDimensions = (): { w: number; h: number } => {
    let w = 1040;
    let h = 720;

    switch (aspectRatio) {
      case 'grid-ratio': {
        const ratio = cols / Math.max(1, rows);
        if (ratio >= 1) {
          w = 1040;
          h = Math.round(1040 / ratio);
        } else {
          h = 840;
          w = Math.round(840 * ratio);
        }
        return { w, h };
      }
      case 'cinema-16x9':
        w = 1120;
        h = 630;
        break;
      case 'cinema-16x10':
        w = 1080;
        h = 675;
        break;
      case 'landscape-4x3':
        w = 1000;
        h = 750;
        break;
      case 'square':
        w = 820;
        h = 820;
        break;
      case 'A4':
      case 'A3':
        w = 740;
        h = 1046;
        break;
      case 'swiss-70x100':
        w = 720;
        h = 1028;
        break;
      case 'golden':
        w = 1040;
        h = Math.round(1040 / 1.618);
        break;
      case 'editorial-4x5':
        w = 800;
        h = 1000;
        break;
      case 'vertical-9x16':
        w = 580;
        h = 1030;
        break;
      default:
        w = 1040;
        h = 720;
        break;
    }

    if (aspectRatio !== 'square') {
      const currentlyPortrait = h > w;
      if (paperOrientation === 'landscape' && currentlyPortrait) {
        return { w: h, h: w };
      }
      if (paperOrientation === 'portrait' && !currentlyPortrait) {
        return { w: h, h: w };
      }
    }

    return { w, h };
  };

  const dims = getBaseDimensions();

  return (
    <div
      onWheel={onCanvasWheel}
      onMouseDown={onCanvasPanStart}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectBlock(null);
        }
      }}
      className={`win95-inset w-full h-full flex items-center justify-center overflow-hidden select-none relative bg-[#808080] ${
        isSpacePanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Zoom & Pan Transform Wrapper */}
      <div
        style={
          isFillViewport
            ? {
                width: '100%',
                height: '100%',
                padding: '14px',
                transform:
                  zoom !== 1 || panOffset.x !== 0 || panOffset.y !== 0
                    ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom})`
                    : undefined,
                transformOrigin: 'center center',
              }
            : {
                width: `${dims.w}px`,
                height: `${dims.h}px`,
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center center',
              }
        }
        className="flex items-center justify-center relative"
      >
        {/* Classic Win95 Document Page Sheet with hard black drop shadow */}
        <div
          id="poster-artwork-node"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onSelectBlock(null);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            padding: `${marginPadding}px`,
            backgroundColor: '#FFFFFF',
            border: '1px solid #000000',
            boxShadow: '4px 4px 0px #000000',
          }}
          className="relative flex flex-col justify-between overflow-hidden"
        >
          {/* Core CSS Grid Stage */}
          <div className="relative flex-1 min-h-0">
            {/* Underlying Atomic Raster Guides (shows all cols × rows cells) */}
            {showGridGuides && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  gap: `${gap}px`,
                }}
                className="absolute inset-0 pointer-events-none z-0"
              >
                {Array.from({ length: cols * rows }).map((_, idx) => (
                  <div
                    key={`guide-${idx}`}
                    style={{
                      borderRadius: `${borderRadius}px`,
                      borderColor: '#C0C0C0',
                    }}
                    className="border border-dotted"
                  />
                ))}
              </div>
            )}

            {/* Placed Grid Containers (Pure Geometry — No Typography Inside) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gap: `${gap}px`,
              }}
              className="relative w-full h-full z-10"
            >
              {displayedBlocks.map((block) => {
                const custom: BoxCustomStyle = {
                  ...(block.customStyle || {}),
                  ...(boxStyles[block.id] || {}),
                };
                const isSelected = selectedBlockId === block.id;
                const isHovered = hoveredBlockId === block.id;
                const isDragTarget = dragOverBlockId === block.id;
                const isVoid = Boolean(custom.isNegativeVoid);

                const borderColor = isSelected ? '#000080' : '#000000';
                const effectiveBorderWidth = isSelected
                  ? Math.max(2, gridBorderWidth)
                  : showGridLines
                  ? gridBorderWidth
                  : 0;

                if (isVoid) {
                  return (
                    <div
                      key={block.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBlock(isSelected ? null : block.id);
                      }}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                      style={{
                        gridColumn: `${block.col + 1} / span ${block.colSpan}`,
                        gridRow: `${block.row + 1} / span ${block.rowSpan}`,
                        borderRadius: `${borderRadius}px`,
                      }}
                      className={`relative cursor-pointer ${
                        isSelected
                          ? 'border-2 border-dashed border-[#000080] bg-[#000080]/10'
                          : 'border border-dashed border-transparent hover:border-[#808080]'
                      }`}
                    />
                  );
                }

                const resolvedFill = resolveContainerFill(
                  block,
                  config,
                  posterConfig.colorConfig,
                  custom,
                  'canvas-grad'
                );

                const shadowStyle = posterConfig.colorConfig?.containerShadowStyle || 'brutalist-hard';
                let containerBoxShadow: string | undefined = undefined;
                if (shadowStyle === 'brutalist-hard') {
                  containerBoxShadow = '3px 3px 0px #000000';
                } else if (shadowStyle === 'deep-drop') {
                  containerBoxShadow = '6px 6px 0px #000000';
                } else if (shadowStyle === 'win95-bevel') {
                  containerBoxShadow = 'inset 1.5px 1.5px 0 rgba(255,255,255,0.7), inset -1.5px -1.5px 0 rgba(0,0,0,0.6)';
                } else if (shadowStyle === 'flat-razor') {
                  containerBoxShadow = undefined;
                }

                return (
                  <div
                    key={block.id}
                    draggable={Boolean(onSwapBlocks)}
                    onDragStart={(e) => {
                      setDraggedBlockId(block.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedBlockId && draggedBlockId !== block.id) {
                        setDragOverBlockId(block.id);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverBlockId === block.id) {
                        setDragOverBlockId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedBlockId && draggedBlockId !== block.id && onSwapBlocks) {
                        onSwapBlocks(draggedBlockId, block.id);
                      }
                      setDraggedBlockId(null);
                      setDragOverBlockId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedBlockId(null);
                      setDragOverBlockId(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlock(isSelected ? null : block.id);
                    }}
                    onMouseEnter={() => setHoveredBlockId(block.id)}
                    onMouseLeave={() => setHoveredBlockId(null)}
                    style={{
                      gridColumn: `${block.col + 1} / span ${block.colSpan}`,
                      gridRow: `${block.row + 1} / span ${block.rowSpan}`,
                      borderRadius: `${borderRadius}px`,
                      background: resolvedFill.background,
                      opacity: posterConfig.colorConfig?.opacity ?? 1.0,
                      borderColor,
                      borderWidth: `${effectiveBorderWidth}px`,
                      borderStyle: 'solid',
                      boxShadow: containerBoxShadow,
                    }}
                    className={`relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'outline-1 outline-dotted outline-[#000080] -outline-offset-4 z-20'
                        : isDragTarget
                        ? 'outline-2 outline-dashed outline-[#000080] z-20'
                        : 'hover:z-10'
                    }`}
                  >
                    {/* Win95 Selection Grab Handles on corners when selected */}
                    {isSelected && (
                      <>
                        <span className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#000080]" />
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#000080]" />
                        <span className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#000080]" />
                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#000080]" />
                      </>
                    )}

                    {/* Optional structural diagonal crosshairs */}
                    {(showCrosshairs || isSelected || isHovered) && (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
                        preserveAspectRatio="none"
                      >
                        <line
                          x1="0"
                          y1="0"
                          x2="100%"
                          y2="100%"
                          stroke="#808080"
                          strokeWidth="1"
                        />
                        <line
                          x1="100%"
                          y1="0"
                          x2="0"
                          y2="100%"
                          stroke="#808080"
                          strokeWidth="1"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
