/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GridConfig, GridStats, LayoutAlgorithmType } from '../types/grid';

export type ExportFormatTab = 'png' | 'webp' | 'svg' | 'css' | 'tailwind' | 'json' | 'print';

interface HeaderProps {
  config: GridConfig;
  stats: GridStats;
  onOpenExport: (tab?: ExportFormatTab) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  zoom?: number;
  isAutoFit?: boolean;
  isFillScreen?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onToggleFillScreen?: () => void;
  onShuffleSeed?: () => void;
  onMutateGrid?: () => void;
  onResetGrid?: () => void;
  onSelectAlgorithm?: (algo: LayoutAlgorithmType) => void;
  showGuides?: boolean;
  onToggleGuides?: () => void;
  showCrosshairs?: boolean;
  onToggleCrosshairs?: () => void;
}

const MENU_ALGORITHMS: { id: LayoutAlgorithmType; label: string }[] = [
  { id: 'bsp', label: 'Recursive BSP Tree' },
  { id: 'gerstner', label: 'Karl Gerstner Mobile' },
  { id: 'fibonacci', label: 'Fibonacci Golden Spiral' },
  { id: 'swiss-columnar', label: 'Swiss 12-Column System' },
  { id: 'hero-anchor', label: 'Focal Hero Anchor' },
  { id: 'guillotine', label: 'Guillotine Cut Slicer' },
  { id: 'gorilla-sun', label: 'Gorilla Sun Bento Pack' },
  { id: 'mondrian', label: 'De Stijl Mondrian' },
  { id: 'quadtree-recursive', label: 'Adaptive Quadtree' },
  { id: 'staggered-brick', label: 'Staggered Masonry' },
  { id: 'treemap', label: 'Squarified Treemap' },
  { id: 'modular-uniform', label: 'Rational Uniform Matrix' },
];

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenExport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  zoom = 1,
  isFillScreen = true,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleFillScreen,
  onShuffleSeed,
  onMutateGrid,
  onResetGrid,
  onSelectAlgorithm,
  showGuides = true,
  onToggleGuides,
  showCrosshairs = false,
  onToggleCrosshairs,
}) => {
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | 'algorithm' | 'view' | 'export' | null>(
    null
  );
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  return (
    <div className="shrink-0 select-none z-40">
      {/* ================================================================= */}
      {/* WINDOWS 95 ACTIVE TITLE BAR                                       */}
      {/* ================================================================= */}
      <div className="win95-titlebar h-[22px] px-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* 16x16 Win95 Pixel Application Icon */}
          <svg
            viewBox="0 0 16 16"
            className="w-4 h-4 shrink-0"
            shapeRendering="crispEdges"
          >
            <rect x="0" y="0" width="16" height="16" fill="#c0c0c0" />
            <rect x="1" y="1" width="14" height="2" fill="#000080" />
            <rect x="1" y="4" width="6" height="5" fill="#ffffff" stroke="#000000" strokeWidth="1" />
            <rect x="8" y="4" width="7" height="5" fill="#008080" stroke="#000000" strokeWidth="1" />
            <rect x="1" y="10" width="9" height="5" fill="#ffff00" stroke="#000000" strokeWidth="1" />
            <rect x="11" y="10" width="4" height="5" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          </svg>
          <span className="font-bold text-[11px] tracking-wide truncate">
            Grid Studio 95 - [{config.algorithm}_{config.cols}x{config.rows}.grd]
          </span>
        </div>

        {/* Classic Win95 Caption Buttons: [ _ ] [ □ ] [ × ] */}
        <div className="flex items-center gap-[2px] shrink-0">
          <button
            onClick={onZoomReset}
            title="Reset Zoom (100%)"
            className="win95-btn w-4 h-[14px] flex items-end justify-center pb-[2px] text-[10px] font-bold leading-none"
          >
            _
          </button>
          <button
            onClick={onToggleFillScreen}
            title={isFillScreen ? 'Restore Proportional Sheet' : 'Maximize to Workspace'}
            className="win95-btn w-4 h-[14px] flex items-center justify-center text-[9px] font-bold leading-none"
          >
            □
          </button>
          <button
            onClick={onResetGrid}
            title="Reset Grid to Default"
            className="win95-btn w-4 h-[14px] flex items-center justify-center text-[10px] font-bold leading-none ml-[1px]"
          >
            ×
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* WINDOWS 95 MENU BAR                                               */}
      {/* ================================================================= */}
      <div
        ref={menuBarRef}
        className="bg-[#c0c0c0] border-b border-[#808080] px-1 py-[1px] flex items-center gap-0.5 text-[11px] relative"
      >
        {/* FILE MENU */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
            onMouseEnter={() => openMenu && setOpenMenu('file')}
            className={`px-2 py-0.5 ${
              openMenu === 'file' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'
            }`}
          >
            <u>F</u>ile
          </button>
          {openMenu === 'file' && (
            <div className="win95-outset absolute left-0 top-full w-48 py-1 z-50 text-black">
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onShuffleSeed?.();
                }}
                className="w-full px-4 py-1 text-left flex justify-between hover:bg-[#000080] hover:text-white"
              >
                <span>New Random Seed</span>
                <span className="opacity-70">F2</span>
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onMutateGrid?.();
                }}
                className="w-full px-4 py-1 text-left flex justify-between hover:bg-[#000080] hover:text-white"
              >
                <span>Mutate Layout</span>
                <span className="opacity-70">F3</span>
              </button>
              <div className="my-1 border-t border-[#808080] border-b border-white" />
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('print');
                }}
                className="w-full px-4 py-1 text-left flex justify-between hover:bg-[#000080] hover:text-white font-bold"
              >
                <span>Large Scale Print...</span>
                <span className="opacity-70">Ctrl+P</span>
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('css');
                }}
                className="w-full px-4 py-1 text-left flex justify-between hover:bg-[#000080] hover:text-white"
              >
                <span>Export Specification...</span>
                <span className="opacity-70">Ctrl+E</span>
              </button>
              <div className="my-1 border-t border-[#808080] border-b border-white" />
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onResetGrid?.();
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Reset Default Grid
              </button>
            </div>
          )}
        </div>

        {/* EDIT MENU */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
            onMouseEnter={() => openMenu && setOpenMenu('edit')}
            className={`px-2 py-0.5 ${
              openMenu === 'edit' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'
            }`}
          >
            <u>E</u>dit
          </button>
          {openMenu === 'edit' && (
            <div className="win95-outset absolute left-0 top-full w-44 py-1 z-50 text-black">
              <button
                disabled={!canUndo}
                onClick={() => {
                  setOpenMenu(null);
                  onUndo?.();
                }}
                className="w-full px-4 py-1 text-left flex justify-between hover:bg-[#000080] hover:text-white disabled:text-[#808080] disabled:hover:bg-transparent"
              >
                <span>Undo</span>
                <span>Ctrl+Z</span>
              </button>
              <button
                disabled={!canRedo}
                onClick={() => {
                  setOpenMenu(null);
                  onRedo?.();
                }}
                className="w-full px-4 py-1 text-left flex justify-between hover:bg-[#000080] hover:text-white disabled:text-[#808080] disabled:hover:bg-transparent"
              >
                <span>Redo</span>
                <span>Ctrl+Y</span>
              </button>
            </div>
          )}
        </div>

        {/* ALGORITHM MENU */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'algorithm' ? null : 'algorithm')}
            onMouseEnter={() => openMenu && setOpenMenu('algorithm')}
            className={`px-2 py-0.5 ${
              openMenu === 'algorithm'
                ? 'bg-[#000080] text-white'
                : 'hover:bg-[#000080] hover:text-white'
            }`}
          >
            <u>A</u>lgorithm
          </button>
          {openMenu === 'algorithm' && (
            <div className="win95-outset absolute left-0 top-full w-56 py-1 z-50 text-black">
              {MENU_ALGORITHMS.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => {
                    setOpenMenu(null);
                    onSelectAlgorithm?.(algo.id);
                  }}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white"
                >
                  <span className="w-3 font-bold">
                    {config.algorithm === algo.id ? '✓' : ''}
                  </span>
                  <span>{algo.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'view' ? null : 'view')}
            onMouseEnter={() => openMenu && setOpenMenu('view')}
            className={`px-2 py-0.5 ${
              openMenu === 'view' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'
            }`}
          >
            <u>V</u>iew
          </button>
          {openMenu === 'view' && (
            <div className="win95-outset absolute left-0 top-full w-52 py-1 z-50 text-black">
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onToggleGuides?.();
                }}
                className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white"
              >
                <span className="w-3 font-bold">{showGuides ? '✓' : ''}</span>
                <span>Underlying Cell Guides</span>
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onToggleCrosshairs?.();
                }}
                className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white"
              >
                <span className="w-3 font-bold">{showCrosshairs ? '✓' : ''}</span>
                <span>Diagonal Crosshairs</span>
              </button>
              <div className="my-1 border-t border-[#808080] border-b border-white" />
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onZoomIn?.();
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Zoom In (+)
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onZoomOut?.();
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Zoom Out (-)
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onZoomReset?.();
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Reset Zoom (100%)
              </button>
            </div>
          )}
        </div>

        {/* EXPORT MENU */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'export' ? null : 'export')}
            onMouseEnter={() => openMenu && setOpenMenu('export')}
            className={`px-2 py-0.5 ${
              openMenu === 'export'
                ? 'bg-[#000080] text-white'
                : 'hover:bg-[#000080] hover:text-white'
            }`}
          >
            E<u>x</u>port
          </button>
          {openMenu === 'export' && (
            <div className="win95-outset absolute left-0 top-full w-56 py-1 z-50 text-black">
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('print');
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white font-bold"
              >
                Large Scale Print (A0-A3 / 24x36)
              </button>
              <div className="my-1 border-t border-[#808080] border-b border-white" />
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('css');
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                CSS Grid Stylesheet (.css)
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('tailwind');
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                React + Tailwind Component (.tsx)
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('svg');
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Vector Wireframe (.svg)
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('png');
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Bitmap Image (.png)
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExport('json');
                }}
                className="w-full px-4 py-1 text-left hover:bg-[#000080] hover:text-white"
              >
                Grid Coordinates (.json)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* WINDOWS 95 3D TOOLBAR                                             */}
      {/* ================================================================= */}
      <div className="bg-[#c0c0c0] border-t border-white border-b border-[#808080] px-2 py-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={onShuffleSeed}
            className="win95-btn px-2.5 py-1 text-[11px] flex items-center gap-1.5"
          >
            <span className="font-bold">Shuffle Seed</span>
          </button>

          <button
            onClick={onMutateGrid}
            className="win95-btn px-2.5 py-1 text-[11px] flex items-center gap-1.5"
          >
            <span>Mutate Grid</span>
          </button>

          <div className="h-4 w-[2px] mx-1 border-l border-[#808080] border-r border-white" />

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="win95-btn px-2 py-1 text-[11px]"
          >
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="win95-btn px-2 py-1 text-[11px]"
          >
            Redo
          </button>

          <div className="h-4 w-[2px] mx-1 border-l border-[#808080] border-r border-white hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1">
            <button onClick={onZoomOut} className="win95-btn px-2 py-1 text-[11px]">
              -
            </button>
            <button
              onClick={onZoomReset}
              className="win95-inset px-2 py-0.5 text-[11px] font-mono-code min-w-[48px] text-center"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={onZoomIn} className="win95-btn px-2 py-1 text-[11px]">
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenExport('print')}
            className="win95-btn px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 text-[#000080]"
          >
            <span>Print...</span>
          </button>
          <button
            onClick={() => onOpenExport('css')}
            className="win95-btn px-3 py-1 text-[11px] font-bold"
          >
            Export...
          </button>
        </div>
      </div>
    </div>
  );
};
