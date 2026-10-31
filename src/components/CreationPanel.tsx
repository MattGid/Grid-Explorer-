/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlgorithmicStep,
  BoxCustomStyle,
  BrutalistShadowStyle,
  ContainerColorConfig,
  ContainerFillMode,
  FocalLocus,
  GradientDirection,
  GridBlock,
  GridConfig,
  GridStats,
  LayoutAlgorithmType,
  PackingBias,
  PaletteDistribution,
  PosterAspectRatio,
  PosterConfig,
  SymmetryMode,
  VariationSnapshot,
} from '../types/grid';
import { ALL_SPAN_OPTIONS, GRID_PRESETS } from '../data/presets';
import { COLOR_SCHEMES, getColorScheme } from '../data/colorSchemes';
import { DEFAULT_COLOR_CONFIG } from '../utils/containerColorResolver';
import {
  Shuffle,
  Sparkles,
  EyeOff,
  Code2,
  Palette,
  Paintbrush,
  RotateCcw,
} from 'lucide-react';
import { ExportFormatTab } from './Header';

export type GridWorkbenchTab = 'algorithms' | 'parameters' | 'colours';

interface CreationPanelProps {
  config: GridConfig;
  posterConfig: PosterConfig;
  blocks: GridBlock[];
  stats: GridStats;
  steps: AlgorithmicStep[];
  activeStepIndex: number | null;
  onSelectStepIndex: (idx: number | null) => void;
  boxStyles: Record<string, BoxCustomStyle>;
  selectedBlock: GridBlock | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateConfig: (partial: Partial<GridConfig>) => void;
  onUpdatePosterConfig: (partial: Partial<PosterConfig>) => void;
  onUpdateBoxStyle: (blockId: string, partial: Partial<BoxCustomStyle>) => void;
  onResizeBlock: (id: string, colSpan: number, rowSpan: number) => void;
  onShuffleSeed: () => void;
  onMutateGrid: () => void;
  onResetGrid: () => void;
  variations: VariationSnapshot[];
  onSaveVariation: () => void;
  onLoadVariation: (v: VariationSnapshot) => void;
  onDeleteVariation: (id: string) => void;
  onOpenExport: (tab?: ExportFormatTab) => void;
  theme?: 'light' | 'dark';
}

const ALGORITHM_LIST: {
  id: LayoutAlgorithmType;
  shortName: string;
  badge: string;
}[] = [
  { id: 'bsp', shortName: 'Recursive BSP', badge: 'Space Partition' },
  { id: 'gerstner', shortName: 'Gerstner Mobile', badge: '12/16/24 Harmonic' },
  { id: 'fibonacci', shortName: 'Fibonacci Spiral', badge: '1 : 1.618 Golden' },
  { id: 'swiss-columnar', shortName: 'Swiss Columnar', badge: '12-Col System' },
  { id: 'hero-anchor', shortName: 'Hero Anchor', badge: 'Focal Core' },
  { id: 'guillotine', shortName: 'Guillotine Cut', badge: 'Tier Slicer' },
  { id: 'gorilla-sun', shortName: 'Gorilla Sun', badge: '2D Bento Pack' },
  { id: 'mondrian', shortName: 'Mondrian', badge: 'De Stijl' },
  { id: 'quadtree-recursive', shortName: 'Quadtree', badge: '4-Way Fractal' },
  { id: 'staggered-brick', shortName: 'Staggered Brick', badge: 'Running Bond' },
  { id: 'treemap', shortName: 'Squarified Treemap', badge: 'Area Weighted' },
  { id: 'modular-uniform', shortName: 'Uniform Matrix', badge: 'Rational Grid' },
];

const renderAlgorithmSchematicIcon = (id: LayoutAlgorithmType) => {
  switch (id) {
    case 'bsp':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="13" y1="2" x2="13" y2="22" />
          <line x1="2" y1="14" x2="13" y2="14" />
          <line x1="13" y1="10" x2="22" y2="10" />
          <line x1="17.5" y1="10" x2="17.5" y2="22" />
        </svg>
      );
    case 'gerstner':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="2" y1="8.5" x2="22" y2="8.5" />
          <line x1="2" y1="15.5" x2="22" y2="15.5" />
          <line x1="12" y1="2" x2="12" y2="8.5" />
          <line x1="8.5" y1="8.5" x2="8.5" y2="15.5" />
          <line x1="15.5" y1="8.5" x2="15.5" y2="15.5" />
          <line x1="7" y1="15.5" x2="7" y2="22" />
          <line x1="12" y1="15.5" x2="12" y2="22" />
          <line x1="17" y1="15.5" x2="17" y2="22" />
        </svg>
      );
    case 'fibonacci':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="14" y1="2" x2="14" y2="22" />
          <line x1="14" y1="14" x2="22" y2="14" />
          <line x1="17" y1="14" x2="17" y2="22" />
          <path d="M 2 22 A 12 12 0 0 1 14 10" strokeDasharray="2 1.5" />
        </svg>
      );
    case 'hero-anchor':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <rect x="2" y="2" width="13" height="13" fill="currentColor" fillOpacity="0.25" />
          <line x1="15" y1="2" x2="15" y2="22" />
          <line x1="2" y1="15" x2="22" y2="15" />
          <line x1="8.5" y1="15" x2="8.5" y2="22" />
          <line x1="15" y1="8.5" x2="22" y2="8.5" />
        </svg>
      );
    case 'guillotine':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="2" y1="9" x2="22" y2="9" />
          <line x1="2" y1="16" x2="22" y2="16" />
          <line x1="14" y1="2" x2="14" y2="9" />
          <line x1="9" y1="9" x2="9" y2="16" />
          <line x1="16" y1="16" x2="16" y2="22" />
        </svg>
      );
    case 'gorilla-sun':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="9" height="9" />
          <rect x="13" y="2" width="9" height="5" />
          <rect x="13" y="9" width="4" height="6" />
          <rect x="19" y="9" width="3" height="13" />
          <rect x="2" y="13" width="9" height="9" />
          <rect x="13" y="17" width="4" height="5" />
        </svg>
      );
    case 'mondrian':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="10" y1="2" x2="10" y2="22" />
          <line x1="2" y1="13" x2="22" y2="13" />
          <line x1="17" y1="2" x2="17" y2="13" />
          <line x1="10" y1="18" x2="22" y2="18" />
        </svg>
      );
    case 'quadtree-recursive':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="17" y1="2" x2="17" y2="12" />
          <line x1="12" y1="7" x2="22" y2="7" />
          <line x1="7" y1="12" x2="7" y2="22" />
          <line x1="2" y1="17" x2="12" y2="17" />
        </svg>
      );
    case 'staggered-brick':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="2" y1="8.5" x2="22" y2="8.5" />
          <line x1="2" y1="15.5" x2="22" y2="15.5" />
          <line x1="12" y1="2" x2="12" y2="8.5" />
          <line x1="7" y1="8.5" x2="7" y2="15.5" />
          <line x1="17" y1="8.5" x2="17" y2="15.5" />
          <line x1="12" y1="15.5" x2="12" y2="22" />
        </svg>
      );
    case 'swiss-columnar':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="5" />
          <rect x="2" y="9" width="6" height="13" />
          <rect x="10" y="9" width="12" height="6" />
          <rect x="10" y="17" width="5.5" height="5" />
          <rect x="16.5" y="17" width="5.5" height="5" />
        </svg>
      );
    case 'treemap':
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="11" height="12" />
          <rect x="13" y="2" width="9" height="8" />
          <rect x="13" y="10" width="9" height="6" />
          <rect x="2" y="14" width="6" height="8" />
          <rect x="8" y="14" width="5" height="8" />
          <rect x="13" y="16" width="5" height="6" />
          <rect x="18" y="16" width="4" height="6" />
        </svg>
      );
    case 'modular-uniform':
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" />
          <line x1="8.6" y1="2" x2="8.6" y2="22" />
          <line x1="15.3" y1="2" x2="15.3" y2="22" />
          <line x1="2" y1="8.6" x2="22" y2="8.6" />
          <line x1="2" y1="15.3" x2="22" y2="15.3" />
        </svg>
      );
  }
};

export const CreationPanel: React.FC<CreationPanelProps> = ({
  config,
  posterConfig,
  boxStyles,
  selectedBlock,
  onSelectBlock,
  onUpdateConfig,
  onUpdatePosterConfig,
  onUpdateBoxStyle,
  onResizeBlock,
  onShuffleSeed,
  onMutateGrid,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<GridWorkbenchTab>('algorithms');
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<'all' | 'retro-os' | 'brutalism'>('all');

  const colorConfig: ContainerColorConfig = posterConfig.colorConfig || DEFAULT_COLOR_CONFIG;
  const currentScheme = getColorScheme(colorConfig.schemeId);

  const handleUpdateColorConfig = (partial: Partial<ContainerColorConfig>) => {
    onUpdatePosterConfig({
      colorConfig: {
        ...colorConfig,
        ...partial,
      },
    });
  };

  const handleToggleSpan = (span: string) => {
    const exists = config.allowedSpans.includes(span);
    if (exists && config.allowedSpans.length <= 1) return;
    const next = exists
      ? config.allowedSpans.filter((s) => s !== span)
      : [...config.allowedSpans, span];
    onUpdateConfig({ allowedSpans: next });
  };

  return (
    <aside className="w-[330px] sm:w-[355px] shrink-0 h-full bg-[#c0c0c0] text-black p-1.5 flex flex-col select-none">
      {/* Classic Windows 95 Property Sheet 3 Tabs */}
      <div className="flex items-end px-0.5 shrink-0 flex-wrap">
        <button
          onClick={() => setActiveTab('algorithms')}
          className={`px-2.5 py-1 text-[11px] font-bold win95-tab ${
            activeTab === 'algorithms' ? 'win95-tab-active' : 'text-[#222222]'
          }`}
        >
          Algorithms
        </button>
        <button
          onClick={() => setActiveTab('parameters')}
          className={`px-2.5 py-1 text-[11px] font-bold win95-tab ${
            activeTab === 'parameters' ? 'win95-tab-active' : 'text-[#222222]'
          }`}
        >
          Parameters
        </button>
        <button
          onClick={() => setActiveTab('colours')}
          className={`px-2.5 py-1 text-[11px] font-bold win95-tab ${
            activeTab === 'colours' ? 'win95-tab-active' : 'text-[#222222]'
          }`}
        >
          Colour & Fill
        </button>
      </div>

      {/* Property Sheet Body (Outset 3D Frame) */}
      <div className="win95-outset flex-1 min-h-0 flex flex-col p-2 overflow-hidden">
        {/* Selected Container Inspector */}
        {selectedBlock && (
          <fieldset className="win95-groupbox p-2 mb-2 shrink-0 space-y-2">
            <legend className="font-bold">
              Selected Cell ({selectedBlock.colSpan}×{selectedBlock.rowSpan})
            </legend>

            <div className="flex items-center justify-between text-[11px]">
              <span>
                Col {selectedBlock.col + 1}, Row {selectedBlock.row + 1}
              </span>
              <button
                onClick={() => onSelectBlock(null)}
                className="win95-btn px-2 py-0.5 text-[10px]"
              >
                Deselect
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span>Col Span:</span>
                  <span className="font-mono-code font-bold">{selectedBlock.colSpan}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, config.cols - selectedBlock.col)}
                  value={selectedBlock.colSpan}
                  onChange={(e) =>
                    onResizeBlock(
                      selectedBlock.id,
                      parseInt(e.target.value, 10),
                      selectedBlock.rowSpan
                    )
                  }
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span>Row Span:</span>
                  <span className="font-mono-code font-bold">{selectedBlock.rowSpan}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, config.rows - selectedBlock.row)}
                  value={selectedBlock.rowSpan}
                  onChange={(e) =>
                    onResizeBlock(
                      selectedBlock.id,
                      selectedBlock.colSpan,
                      parseInt(e.target.value, 10)
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const currentVoid = Boolean(
                  boxStyles[selectedBlock.id]?.isNegativeVoid ??
                    selectedBlock.customStyle?.isNegativeVoid
                );
                onUpdateBoxStyle(selectedBlock.id, { isNegativeVoid: !currentVoid });
              }}
              className={`w-full py-1 px-2 text-[11px] flex items-center justify-center gap-1.5 ${
                boxStyles[selectedBlock.id]?.isNegativeVoid ||
                selectedBlock.customStyle?.isNegativeVoid
                  ? 'win95-btn-latched'
                  : 'win95-btn'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span>Toggle Empty Space (Void)</span>
            </button>
          </fieldset>
        )}

        {/* Scrollable Property Sheet Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {/* ============================================================= */}
          {/* TAB 1: ALGORITHMS                                             */}
          {/* ============================================================= */}
          {activeTab === 'algorithms' && (
            <>
              {/* Random Seed & Mutate */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">Generator Seed</legend>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px]">PRNG Seed #:</label>
                  <input
                    type="number"
                    value={config.seed}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdateConfig({ seed: Math.abs(val) });
                    }}
                    className="win95-inset w-24 px-1.5 py-0.5 text-[11px] font-mono-code font-bold text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={onShuffleSeed}
                    className="win95-btn py-1 px-2 text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Shuffle</span>
                  </button>
                  <button
                    onClick={onMutateGrid}
                    className="win95-btn py-1 px-2 text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#000080]" />
                    <span>Mutate</span>
                  </button>
                </div>
              </fieldset>

              {/* 12 Layout Algorithms */}
              <fieldset className="win95-groupbox p-2 space-y-1.5">
                <legend className="font-bold">12 Layout Algorithms</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALGORITHM_LIST.map((item) => {
                    const isSelected = config.algorithm === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onUpdateConfig({ algorithm: item.id })}
                        className={`p-1.5 text-left flex items-center gap-1.5 ${
                          isSelected ? 'win95-btn-latched' : 'win95-btn'
                        }`}
                      >
                        <div
                          className={`p-1 shrink-0 ${
                            isSelected
                              ? 'bg-[#000080] text-white'
                              : 'bg-[#dfdfdf] text-black border border-[#808080]'
                          }`}
                        >
                          {renderAlgorithmSchematicIcon(item.id)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold leading-tight truncate">
                            {item.shortName}
                          </div>
                          <div className="text-[9px] font-mono-code text-[#404040] truncate">
                            {item.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Grid Dimensions */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">
                  Matrix Dimensions ({config.cols} × {config.rows})
                </legend>

                <div className="grid grid-cols-3 gap-1">
                  {[
                    { cols: 12, rows: 8, label: '12×8' },
                    { cols: 16, rows: 10, label: '16×10' },
                    { cols: 12, rows: 12, label: '12×12' },
                    { cols: 13, rows: 8, label: '13×8' },
                    { cols: 8, rows: 6, label: '8×6' },
                    { cols: 6, rows: 4, label: '6×4' },
                  ].map((preset) => {
                    const active = config.cols === preset.cols && config.rows === preset.rows;
                    return (
                      <button
                        key={preset.label}
                        onClick={() =>
                          onUpdateConfig({
                            cols: preset.cols,
                            rows: preset.rows,
                            maxColSpan: Math.min(config.maxColSpan, preset.cols),
                            maxRowSpan: Math.min(config.maxRowSpan, preset.rows),
                          })
                        }
                        className={`py-1 px-1.5 text-[11px] font-mono-code ${
                          active ? 'win95-btn-latched' : 'win95-btn'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>Columns:</span>
                      <span className="font-mono-code font-bold">{config.cols}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={24}
                      value={config.cols}
                      onChange={(e) => {
                        const cols = parseInt(e.target.value, 10);
                        onUpdateConfig({
                          cols,
                          maxColSpan: Math.min(config.maxColSpan, cols),
                        });
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>Rows:</span>
                      <span className="font-mono-code font-bold">{config.rows}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      value={config.rows}
                      onChange={(e) => {
                        const rows = parseInt(e.target.value, 10);
                        onUpdateConfig({
                          rows,
                          maxRowSpan: Math.min(config.maxRowSpan, rows),
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </fieldset>

              {/* System Presets */}
              <fieldset className="win95-groupbox p-2 space-y-1">
                <legend className="font-bold">System Presets</legend>
                <div className="win95-inset p-1 max-h-44 overflow-y-auto space-y-0.5">
                  {GRID_PRESETS.map((preset) => {
                    const isActive =
                      config.algorithm === preset.config.algorithm &&
                      config.cols === preset.config.cols &&
                      config.rows === preset.config.rows;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => onUpdateConfig({ ...preset.config })}
                        className={`w-full px-1.5 py-1 text-left text-[11px] flex items-center justify-between ${
                          isActive
                            ? 'bg-[#000080] text-white font-bold'
                            : 'hover:bg-[#dfdfdf] text-black'
                        }`}
                      >
                        <span className="truncate">{preset.name}</span>
                        <span className="font-mono-code text-[10px] shrink-0 ml-2">
                          {preset.config.cols}×{preset.config.rows}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {/* ============================================================= */}
          {/* TAB 2: PARAMETERS                                             */}
          {/* ============================================================= */}
          {activeTab === 'parameters' && (
            <>
              {/* Spacing, Radius, Border & Void */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">Spacing & Borders</legend>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Gutter Gap:</span>
                    <span className="font-mono-code font-bold">{config.gap}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    value={config.gap}
                    onChange={(e) => onUpdateConfig({ gap: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Corner Radius:</span>
                    <span className="font-mono-code font-bold">{config.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={28}
                    value={config.borderRadius}
                    onChange={(e) =>
                      onUpdateConfig({ borderRadius: parseInt(e.target.value, 10) })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Border Weight:</span>
                    <span className="font-mono-code font-bold">
                      {posterConfig.gridBorderWidth ?? 1.5}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={6}
                    step={0.5}
                    value={posterConfig.gridBorderWidth ?? 1.5}
                    onChange={(e) =>
                      onUpdatePosterConfig({ gridBorderWidth: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Empty Void Ratio:</span>
                    <span className="font-mono-code font-bold">
                      {Math.round((config.voidDensity || 0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.4}
                    step={0.05}
                    value={config.voidDensity || 0}
                    onChange={(e) => onUpdateConfig({ voidDensity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </fieldset>

              {/* Subdivision & Packing */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">Subdivision & Packing</legend>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Subdivision Depth:</span>
                    <span className="font-mono-code font-bold">{config.bspDepth}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={config.bspDepth}
                    onChange={(e) => onUpdateConfig({ bspDepth: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Split Variance:</span>
                    <span className="font-mono-code font-bold">
                      {Math.round(config.bspSplitVariance * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.45}
                    step={0.05}
                    value={config.bspSplitVariance}
                    onChange={(e) =>
                      onUpdateConfig({ bspSplitVariance: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px]">Symmetry Mode:</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'none', label: 'None' },
                        { id: 'bilateral-x', label: 'Mirror X' },
                        { id: 'radial', label: 'Radial' },
                      ] as { id: SymmetryMode; label: string }[]
                    ).map((sym) => (
                      <button
                        key={sym.id}
                        onClick={() => onUpdateConfig({ symmetryMode: sym.id })}
                        className={`py-1 text-[10px] ${
                          (config.symmetryMode || 'none') === sym.id
                            ? 'win95-btn-latched'
                            : 'win95-btn'
                        }`}
                      >
                        {sym.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px]">Proportion Bias:</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'balanced', label: 'Balanced' },
                        { id: 'prefer-wide', label: 'Wide' },
                        { id: 'prefer-tall', label: 'Tall' },
                        { id: 'prefer-large', label: 'Large' },
                        { id: 'focal-hero', label: 'Hero' },
                      ] as { id: PackingBias; label: string }[]
                    ).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => onUpdateConfig({ bias: b.id })}
                        className={`py-1 text-[10px] ${
                          config.bias === b.id ? 'win95-btn-latched' : 'win95-btn'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px]">Focal Anchor:</div>
                  <div className="grid grid-cols-5 gap-1">
                    {(
                      [
                        { id: 'top-left', label: 'NW' },
                        { id: 'top-right', label: 'NE' },
                        { id: 'center', label: 'CTR' },
                        { id: 'bottom-left', label: 'SW' },
                        { id: 'bottom-right', label: 'SE' },
                      ] as { id: FocalLocus; label: string }[]
                    ).map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => onUpdateConfig({ focalLocus: loc.id })}
                        className={`py-1 text-[10px] font-mono-code ${
                          config.focalLocus === loc.id ? 'win95-btn-latched' : 'win95-btn'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Allowed Cell Spans */}
              <fieldset className="win95-groupbox p-2 space-y-1.5">
                <legend className="font-bold">Allowed Cell Spans</legend>
                <div className="flex justify-end">
                  <button
                    onClick={() => onUpdateConfig({ allowedSpans: ALL_SPAN_OPTIONS })}
                    className="win95-btn px-2 py-0.5 text-[10px]"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {ALL_SPAN_OPTIONS.map((span) => {
                    const active = config.allowedSpans.includes(span);
                    return (
                      <button
                        key={span}
                        onClick={() => handleToggleSpan(span)}
                        className={`py-1 text-[11px] font-mono-code ${
                          active ? 'win95-btn-latched' : 'win95-btn text-[#555555]'
                        }`}
                      >
                        {span.replace('x', '×')}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Canvas Format & Guides */}
              <fieldset className="win95-groupbox p-2 space-y-1.5">
                <legend className="font-bold">Sheet Aspect & Guides</legend>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'fill-viewport', label: 'Fill' },
                      { id: 'grid-ratio', label: 'Grid' },
                      { id: 'cinema-16x9', label: '16:9' },
                      { id: 'landscape-4x3', label: '4:3' },
                      { id: 'A4', label: 'A4' },
                      { id: 'square', label: '1:1' },
                    ] as { id: PosterAspectRatio; label: string }[]
                  ).map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => onUpdatePosterConfig({ aspectRatio: fmt.id })}
                      className={`py-1 text-[10px] font-mono-code ${
                        posterConfig.aspectRatio === fmt.id ? 'win95-btn-latched' : 'win95-btn'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={posterConfig.showGridGuides !== false}
                    onChange={(e) => onUpdatePosterConfig({ showGridGuides: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#000080]"
                  />
                  <span>Show Dotted Matrix Guides</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={Boolean(posterConfig.showCrosshairs)}
                    onChange={(e) => onUpdatePosterConfig({ showCrosshairs: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#000080]"
                  />
                  <span>Show Container Diagonal Crosshairs</span>
                </label>
              </fieldset>
            </>
          )}

          {/* ============================================================= */}
          {/* TAB 3: COLOUR & FILL                                          */}
          {/* ============================================================= */}
          {activeTab === 'colours' && (
            <>
              {/* Fill Mode Switcher */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">Container Fill Mode</legend>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'palette-solid', label: 'Solid Palette' },
                      { id: 'gradient', label: 'Gradients' },
                      { id: 'none', label: 'Wireframe' },
                    ] as { id: ContainerFillMode; label: string }[]
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleUpdateColorConfig({ fillMode: mode.id })}
                      className={`py-1.5 px-1 text-[10px] font-bold ${
                        colorConfig.fillMode === mode.id ? 'win95-btn-latched' : 'win95-btn'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#555555] leading-tight">
                  {colorConfig.fillMode === 'gradient'
                    ? 'Dual-stop gradients rendered strictly within each container.'
                    : colorConfig.fillMode === 'palette-solid'
                    ? 'Individual solid colors distributed across containers from the active scheme.'
                    : 'Clean transparent wireframe with structural outer borders.'}
                </p>
              </fieldset>

              {/* Curated Retro OS & Brutalism Colour Schemes */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <legend className="font-bold">Retro OS & Brutalist Palettes</legend>
                  <button
                    onClick={() =>
                      handleUpdateColorConfig({
                        seedOffset: (colorConfig.seedOffset || 0) + 1,
                      })
                    }
                    className="win95-btn px-2 py-0.5 text-[10px] flex items-center gap-1"
                    title="Re-randomize colors among containers"
                  >
                    <Shuffle className="w-3 h-3 text-[#000080]" />
                    <span>Shuffle</span>
                  </button>
                </div>

                {/* Filter Tabs: All, Retro OS, Brutalism */}
                <div className="flex gap-1 pb-0.5">
                  {(
                    [
                      { id: 'all', label: `All (${COLOR_SCHEMES.length})` },
                      { id: 'retro-os', label: 'Retro OS & HW' },
                      { id: 'brutalism', label: 'Digital Brutalism' },
                    ] as { id: 'all' | 'retro-os' | 'brutalism'; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSchemeCategoryFilter(f.id)}
                      className={`flex-1 py-0.5 text-[9px] font-bold ${
                        schemeCategoryFilter === f.id ? 'win95-btn-latched' : 'win95-btn'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="win95-inset p-1 max-h-56 overflow-y-auto space-y-1">
                  {COLOR_SCHEMES.filter(
                    (s) =>
                      schemeCategoryFilter === 'all' || s.category === schemeCategoryFilter
                  ).map((scheme) => {
                    const isSelected = colorConfig.schemeId === scheme.id;
                    return (
                      <button
                        key={scheme.id}
                        onClick={() => handleUpdateColorConfig({ schemeId: scheme.id })}
                        className={`w-full p-1.5 text-left text-[11px] rounded transition-none ${
                          isSelected
                            ? 'bg-[#000080] text-white font-bold'
                            : 'hover:bg-[#dfdfdf] text-black'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="truncate">{scheme.name}</span>
                          <span className="text-[9px] font-mono-code opacity-75 shrink-0">
                            {scheme.colors.length}c
                          </span>
                        </div>
                        {scheme.hardwareEra && (
                          <div className={`text-[9px] font-mono-code mb-1 truncate ${
                            isSelected ? 'text-[#a3c2ff]' : 'text-[#666666]'
                          }`}>
                            {scheme.hardwareEra}
                          </div>
                        )}
                        {/* Live Color Swatch Ribbon */}
                        <div className="flex h-3 w-full border border-black/40 overflow-hidden">
                          {scheme.colors.map((c, cIdx) => (
                            <span
                              key={cIdx}
                              style={{ backgroundColor: c }}
                              className="flex-1 h-full"
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={Boolean(colorConfig.invertScheme)}
                    onChange={(e) => handleUpdateColorConfig({ invertScheme: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#000080]"
                  />
                  <span>Invert Palette Spectrum Order</span>
                </label>
              </fieldset>

              {/* Digital Brutalism & Container Styling */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">Digital Brutalism Styling</legend>
                <div>
                  <div className="text-[11px] mb-1">Container Shadow & Edge:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {(
                      [
                        { id: 'brutalist-hard', label: 'Hard Shadow (3px)' },
                        { id: 'deep-drop', label: 'Deep Block (6px)' },
                        { id: 'win95-bevel', label: 'Win95 3D Bevel' },
                        { id: 'flat-razor', label: 'Flat Plane (0px)' },
                      ] as { id: BrutalistShadowStyle; label: string }[]
                    ).map((style) => (
                      <button
                        key={style.id}
                        onClick={() => handleUpdateColorConfig({ containerShadowStyle: style.id })}
                        className={`py-1 text-[10px] ${
                          (colorConfig.containerShadowStyle || 'brutalist-hard') === style.id
                            ? 'win95-btn-latched'
                            : 'win95-btn'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Brutalist Border Weight:</span>
                    <span className="font-mono-code font-bold">
                      {posterConfig.gridBorderWidth ?? 1.5}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={6}
                    step={0.5}
                    value={posterConfig.gridBorderWidth ?? 1.5}
                    onChange={(e) =>
                      onUpdatePosterConfig({ gridBorderWidth: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </fieldset>

              {/* Palette Distribution Strategy */}
              <fieldset className="win95-groupbox p-2 space-y-1.5">
                <legend className="font-bold">Palette Distribution</legend>
                <div className="grid grid-cols-2 gap-1">
                  {(
                    [
                      { id: 'random', label: 'Random (PRNG)' },
                      { id: 'sequential', label: 'Sequential Order' },
                      { id: 'coordinate-x', label: 'Left → Right Flow' },
                      { id: 'coordinate-y', label: 'Top → Down Flow' },
                      { id: 'size-based', label: 'Cell Area / Scale' },
                    ] as { id: PaletteDistribution; label: string }[]
                  ).map((dist) => (
                    <button
                      key={dist.id}
                      onClick={() => handleUpdateColorConfig({ paletteDistribution: dist.id })}
                      className={`py-1 text-[10px] ${
                        colorConfig.paletteDistribution === dist.id
                          ? 'win95-btn-latched'
                          : 'win95-btn'
                      }`}
                    >
                      {dist.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Gradient Controls (Only Within Containers) */}
              <fieldset className="win95-groupbox p-2 space-y-2">
                <legend className="font-bold">Gradient Controls (Within Containers)</legend>

                <div>
                  <div className="text-[11px] mb-1">Gradient Vector:</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'to-bottom-right', label: '↘ 135°' },
                        { id: 'to-bottom', label: '↓ 180°' },
                        { id: 'to-right', label: '→ 90°' },
                        { id: 'to-top-right', label: '↗ 45°' },
                        { id: 'radial', label: '⦿ Radial' },
                      ] as { id: GradientDirection; label: string }[]
                    ).map((dir) => (
                      <button
                        key={dir.id}
                        onClick={() => handleUpdateColorConfig({ gradientDirection: dir.id })}
                        className={`py-1 text-[10px] font-mono-code ${
                          colorConfig.gradientDirection === dir.id
                            ? 'win95-btn-latched'
                            : 'win95-btn'
                        }`}
                      >
                        {dir.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Gradient Stop Position:</span>
                    <span className="font-mono-code font-bold">
                      {colorConfig.gradientStopOffset ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={colorConfig.gradientStopOffset ?? 100}
                    onChange={(e) =>
                      handleUpdateColorConfig({ gradientStopOffset: parseInt(e.target.value, 10) })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Fill Opacity:</span>
                    <span className="font-mono-code font-bold">
                      {Math.round((colorConfig.opacity ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={colorConfig.opacity ?? 1.0}
                    onChange={(e) =>
                      handleUpdateColorConfig({ opacity: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </fieldset>

              {/* Selected Cell Paint Swatches */}
              {selectedBlock && (
                <fieldset className="win95-groupbox p-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <legend className="font-bold">Paint Selected Cell</legend>
                    <button
                      onClick={() =>
                        onUpdateBoxStyle(selectedBlock.id, {
                          fillColor: undefined,
                          gradientColor1: undefined,
                          gradientColor2: undefined,
                        })
                      }
                      className="win95-btn px-1.5 py-0.5 text-[9px] flex items-center gap-0.5"
                      title="Reset to default scheme"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-[#404040]">
                    Click a swatch to apply color override:
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {currentScheme.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onUpdateBoxStyle(selectedBlock.id, { fillColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-6 h-6 border border-black shadow-sm win95-outset hover:scale-105"
                        title={c}
                      />
                    ))}
                  </div>
                </fieldset>
              )}
            </>
          )}
        </div>

        {/* Bottom Export Command Button */}
        <div className="pt-2 shrink-0 border-t border-[#808080] mt-1 flex gap-1">
          <button
            onClick={() => onOpenExport('print')}
            className="win95-btn flex-1 py-1.5 px-2 text-[11px] font-bold flex items-center justify-center gap-1 text-[#000080]"
          >
            <span>Print Sheet...</span>
          </button>
          <button
            onClick={() => onOpenExport('css')}
            className="win95-btn flex-1 py-1.5 px-2 text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Export...</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
