/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  GridConfig,
  GridBlock,
  PosterConfig,
  BoxCustomStyle,
  VariationSnapshot,
  LayoutAlgorithmType,
} from './types/grid';
import { GRID_PRESETS, ALL_SPAN_OPTIONS } from './data/presets';
import { generateGridByAlgorithm } from './utils/layoutAlgorithms';
import { Header, ExportFormatTab } from './components/Header';
import { PosterCanvas } from './components/PosterCanvas';
import { CreationPanel } from './components/CreationPanel';
import { ExportModal } from './components/ExportModal';

const ALL_ALGORITHMS: LayoutAlgorithmType[] = [
  'bsp',
  'gerstner',
  'fibonacci',
  'swiss-columnar',
  'hero-anchor',
  'guillotine',
  'gorilla-sun',
  'mondrian',
  'quadtree-recursive',
  'staggered-brick',
  'treemap',
  'modular-uniform',
];

const INITIAL_GRID_CONFIG: GridConfig = {
  ...GRID_PRESETS[0].config,
  algorithm: 'bsp',
  cols: 12,
  rows: 8,
  gap: 10,
  borderRadius: 0,
  seed: 1024,
  bspDepth: 3,
  bspSplitVariance: 0.25,
  voidDensity: 0,
  symmetryMode: 'none',
  aspectConstraint: 'free',
};

const INITIAL_POSTER_CONFIG: PosterConfig = {
  aspectRatio: 'fill-viewport',
  paperOrientation: 'landscape',
  marginPadding: 28,
  showCropMarks: true,
  showGridCoordinates: true,
  showGridGuides: true,
  showCrosshairs: false,
  showGridLines: true,
  gridBorderWidth: 1.5,
  showPosterHeader: false,
  showPosterFooter: false,
  showBoxHeadlines: false,
  showBoxMetadata: false,
  showAllTypography: false,
  typeInformationLevel: 'minimal',
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [config, setConfig] = useState<GridConfig>(INITIAL_GRID_CONFIG);
  const [posterConfig, setPosterConfig] = useState<PosterConfig>(INITIAL_POSTER_CONFIG);
  const [boxStyles, setBoxStyles] = useState<Record<string, BoxCustomStyle>>({});
  const [manualBlocks, setManualBlocks] = useState<GridBlock[] | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  // Export Modal State
  const [exportOpen, setExportOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<ExportFormatTab>('css');

  // Saved Layout Snapshots
  const [variations, setVariations] = useState<VariationSnapshot[]>([]);

  // Undo / Redo History
  const [history, setHistory] = useState<
    { config: GridConfig; posterConfig: PosterConfig; boxStyles: Record<string, BoxCustomStyle> }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isRestoringHistory = useRef(false);

  // Viewport Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Compute Layout Grid via active algorithm
  const generatedResult = useMemo(() => {
    return generateGridByAlgorithm(config);
  }, [config]);

  // Clear manual block overrides whenever config changes
  useEffect(() => {
    setManualBlocks(null);
  }, [config]);

  const blocks = manualBlocks || generatedResult.blocks;
  const stats = generatedResult.stats;
  const steps = generatedResult.steps;

  // Record history on state changes
  useEffect(() => {
    if (isRestoringHistory.current) {
      isRestoringHistory.current = false;
      return;
    }
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, { config, posterConfig, boxStyles }].slice(-30);
      setHistoryIndex(next.length - 1);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isRestoringHistory.current = true;
      const prev = history[historyIndex - 1];
      setConfig(prev.config);
      setPosterConfig(prev.posterConfig);
      setBoxStyles(prev.boxStyles);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isRestoringHistory.current = true;
      const next = history[historyIndex + 1];
      setConfig(next.config);
      setPosterConfig(next.posterConfig);
      setBoxStyles(next.boxStyles);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const handleUpdateConfig = useCallback((partial: Partial<GridConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleUpdatePosterConfig = useCallback((partial: Partial<PosterConfig>) => {
    setPosterConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleUpdateBoxStyle = useCallback((blockId: string, partial: Partial<BoxCustomStyle>) => {
    setBoxStyles((prev) => ({
      ...prev,
      [blockId]: {
        ...(prev[blockId] || {}),
        ...partial,
      },
    }));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Direct Interactive Block Resize
  const handleResizeBlock = useCallback(
    (blockId: string, newColSpan: number, newRowSpan: number) => {
      setManualBlocks((prev) => {
        const list = prev ? [...prev] : [...blocks];
        return list.map((b: GridBlock) =>
          b.id === blockId
            ? {
                ...b,
                colSpan: Math.max(1, Math.min(config.cols - b.col, newColSpan)),
                rowSpan: Math.max(1, Math.min(config.rows - b.row, newRowSpan)),
              }
            : b
        );
      });
    },
    [blocks, config.cols, config.rows]
  );

  // Drag-and-Drop Block Swap
  const handleSwapBlocks = useCallback(
    (sourceId: string, targetId: string) => {
      setManualBlocks((prev) => {
        const list = prev ? [...prev] : [...blocks];
        const sIdx = list.findIndex((b: GridBlock) => b.id === sourceId);
        const tIdx = list.findIndex((b: GridBlock) => b.id === targetId);
        if (sIdx === -1 || tIdx === -1) return list;

        const s = list[sIdx];
        const t = list[tIdx];
        const next = [...list];
        next[sIdx] = {
          ...s,
          col: t.col,
          row: t.row,
          colSpan: Math.min(s.colSpan, config.cols - t.col),
          rowSpan: Math.min(s.rowSpan, config.rows - t.row),
        };
        next[tIdx] = {
          ...t,
          col: s.col,
          row: s.row,
          colSpan: Math.min(t.colSpan, config.cols - s.col),
          rowSpan: Math.min(t.rowSpan, config.rows - s.row),
        };
        return next;
      });
    },
    [blocks, config.cols, config.rows]
  );

  const handleToggleBlockVoid = useCallback(
    (blockId: string) => {
      const block = blocks.find((b: GridBlock) => b.id === blockId);
      const current = Boolean(
        boxStyles[blockId]?.isNegativeVoid ?? block?.customStyle?.isNegativeVoid
      );
      handleUpdateBoxStyle(blockId, { isNegativeVoid: !current });
    },
    [blocks, boxStyles, handleUpdateBoxStyle]
  );

  const handleToggleBlockLock = useCallback(
    (blockId: string) => {
      const block = blocks.find((b: GridBlock) => b.id === blockId);
      const current = Boolean(boxStyles[blockId]?.isLocked ?? block?.customStyle?.isLocked);
      handleUpdateBoxStyle(blockId, { isLocked: !current });
    },
    [blocks, boxStyles, handleUpdateBoxStyle]
  );

  const handleShuffleSeed = useCallback(() => {
    setActiveStepIndex(null);
    setConfig((prev) => ({
      ...prev,
      seed: Math.floor(1000 + Math.random() * 9000),
    }));
  }, []);

  const handleMutateGrid = useCallback(() => {
    setActiveStepIndex(null);
    const randomAlgo = ALL_ALGORITHMS[Math.floor(Math.random() * ALL_ALGORITHMS.length)];
    const colChoices = [8, 12, 12, 13, 16];
    const rowChoices = [6, 8, 8, 10, 12];
    const pickIdx = Math.floor(Math.random() * colChoices.length);
    const cols = colChoices[pickIdx];
    const rows = rowChoices[pickIdx];

    setConfig((prev) => ({
      ...prev,
      algorithm: randomAlgo,
      cols,
      rows,
      maxColSpan: Math.min(cols, Math.floor(3 + Math.random() * 5)),
      maxRowSpan: Math.min(rows, Math.floor(2 + Math.random() * 4)),
      gap: [0, 6, 8, 10, 12, 16][Math.floor(Math.random() * 6)],
      bspDepth: Math.floor(2 + Math.random() * 3),
      bspSplitVariance: Number((0.1 + Math.random() * 0.3).toFixed(2)),
      seed: Math.floor(1000 + Math.random() * 9000),
      allowedSpans: ALL_SPAN_OPTIONS,
    }));
  }, []);

  const handleResetGrid = useCallback(() => {
    setActiveStepIndex(null);
    setConfig(INITIAL_GRID_CONFIG);
    setBoxStyles({});
    setManualBlocks(null);
    setSelectedBlockId(null);
  }, []);

  const handleSaveVariation = useCallback(() => {
    const snap: VariationSnapshot = {
      id: `var-${Date.now()}`,
      name: `${config.algorithm.toUpperCase()} ${config.cols}×${config.rows}`,
      timestamp: Date.now(),
      seed: config.seed,
      config: { ...config },
      posterConfig: { ...posterConfig },
      boxStyles: { ...boxStyles },
    };
    setVariations((prev) => [snap, ...prev]);
  }, [config, posterConfig, boxStyles]);

  const handleLoadVariation = useCallback((v: VariationSnapshot) => {
    setActiveStepIndex(null);
    setConfig(v.config);
    setPosterConfig(v.posterConfig);
    setBoxStyles(v.boxStyles);
  }, []);

  const handleDeleteVariation = useCallback((id: string) => {
    setVariations((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Keyboard shortcuts (Undo, Redo, Spacebar Pan)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.code === 'Space') {
        setIsSpacePressed(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        panStartRef.current = null;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleUndo, handleRedo]);

  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setIsAutoFit(false);
      setZoom((z) => Math.min(2.5, Math.max(0.35, Number((z - e.deltaY * 0.0015).toFixed(2)))));
    }
  }, []);

  const handleCanvasPanStart = useCallback(
    (e: React.MouseEvent) => {
      if (!isSpacePressed && e.button !== 1) return;
      e.preventDefault();
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        ox: panOffset.x,
        oy: panOffset.y,
      };
      const onMove = (me: MouseEvent) => {
        if (!panStartRef.current) return;
        setPanOffset({
          x: panStartRef.current.ox + (me.clientX - panStartRef.current.x),
          y: panStartRef.current.oy + (me.clientY - panStartRef.current.y),
        });
      };
      const onUp = () => {
        panStartRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [isSpacePressed, panOffset]
  );

  const selectedBlock = useMemo(
    () => blocks.find((b: GridBlock) => b.id === selectedBlockId) || null,
    [blocks, selectedBlockId]
  );

  const activeStep =
    activeStepIndex !== null && steps[activeStepIndex] ? steps[activeStepIndex] : null;

  return (
    <div className="h-full w-full overflow-hidden bg-[#008080] p-1 sm:p-1.5 flex flex-col select-none">
      {/* Main Windows 95 Application Window */}
      <div className="win95-window flex-1 min-h-0 w-full flex flex-col p-1 overflow-hidden">
        <Header
          config={config}
          stats={stats}
          onOpenExport={(tab = 'css') => {
            setExportInitialTab(tab);
            setExportOpen(true);
          }}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoom={zoom}
          isAutoFit={isAutoFit}
          isFillScreen={posterConfig.aspectRatio === 'fill-viewport'}
          onZoomIn={() => {
            setIsAutoFit(false);
            setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
          }}
          onZoomOut={() => {
            setIsAutoFit(false);
            setZoom((z) => Math.max(0.35, Number((z - 0.15).toFixed(2))));
          }}
          onZoomReset={() => {
            setIsAutoFit(true);
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          onToggleFillScreen={() => {
            setPosterConfig((p) => ({
              ...p,
              aspectRatio: p.aspectRatio === 'fill-viewport' ? 'grid-ratio' : 'fill-viewport',
            }));
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          onShuffleSeed={handleShuffleSeed}
          onMutateGrid={handleMutateGrid}
          onResetGrid={handleResetGrid}
          onSelectAlgorithm={(algorithm) => handleUpdateConfig({ algorithm })}
          showGuides={posterConfig.showGridGuides !== false}
          onToggleGuides={() =>
            handleUpdatePosterConfig({ showGridGuides: posterConfig.showGridGuides === false })
          }
          showCrosshairs={Boolean(posterConfig.showCrosshairs)}
          onToggleCrosshairs={() =>
            handleUpdatePosterConfig({ showCrosshairs: !posterConfig.showCrosshairs })
          }
        />

        <main className="flex-1 min-h-0 flex overflow-hidden">
          <div className="flex-1 min-w-0 h-full relative">
            <PosterCanvas
              blocks={blocks}
              config={config}
              posterConfig={posterConfig}
              boxStyles={boxStyles}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onSwapBlocks={handleSwapBlocks}
              onResizeBlock={handleResizeBlock}
              onToggleBlockVoid={handleToggleBlockVoid}
              onToggleBlockLock={handleToggleBlockLock}
              zoom={zoom}
              panOffset={panOffset}
              isSpacePanning={isSpacePressed}
              onCanvasWheel={handleCanvasWheel}
              onCanvasPanStart={handleCanvasPanStart}
              theme={theme}
              activeStep={activeStep}
            />
          </div>

          <CreationPanel
            config={config}
            posterConfig={posterConfig}
            blocks={blocks}
            stats={stats}
            steps={steps}
            activeStepIndex={activeStepIndex}
            onSelectStepIndex={setActiveStepIndex}
            boxStyles={boxStyles}
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlockId}
            onUpdateConfig={handleUpdateConfig}
            onUpdatePosterConfig={handleUpdatePosterConfig}
            onUpdateBoxStyle={handleUpdateBoxStyle}
            onResizeBlock={handleResizeBlock}
            onShuffleSeed={handleShuffleSeed}
            onMutateGrid={handleMutateGrid}
            onResetGrid={handleResetGrid}
            variations={variations}
            onSaveVariation={handleSaveVariation}
            onLoadVariation={handleLoadVariation}
            onDeleteVariation={handleDeleteVariation}
            onOpenExport={(tab = 'css') => {
              setExportInitialTab(tab);
              setExportOpen(true);
            }}
            theme={theme}
          />
        </main>

        {/* Classic Windows 95 Sunken Status Bar */}
        <footer className="pt-1 flex items-center gap-1 text-[11px] text-black shrink-0">
          <div className="win95-status-pane px-2 py-0.5 flex-1 truncate">
            {selectedBlock
              ? `Selected Container: ${selectedBlock.colSpan}×${selectedBlock.rowSpan} at Col ${
                  selectedBlock.col + 1
                }, Row ${selectedBlock.row + 1}`
              : 'Ready — Click any container to resize or drag to swap positions'}
          </div>
          <div className="win95-status-pane px-2 py-0.5 w-44 font-mono-code truncate hidden sm:block">
            ALG: {config.algorithm.toUpperCase()}
          </div>
          <div className="win95-status-pane px-2 py-0.5 w-40 font-mono-code truncate">
            {config.cols}C × {config.rows}R ({blocks.length} cells)
          </div>
          <div className="win95-status-pane px-2 py-0.5 w-28 font-mono-code flex items-center justify-between">
            <span>SEED #{config.seed}</span>
            {/* Win95 Diagonal Resize Grip */}
            <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 ml-1">
              <line x1="9" y1="1" x2="1" y2="9" stroke="#808080" strokeWidth="1" />
              <line x1="9" y1="2" x2="2" y2="9" stroke="#ffffff" strokeWidth="1" />
              <line x1="9" y1="5" x2="5" y2="9" stroke="#808080" strokeWidth="1" />
              <line x1="9" y1="6" x2="6" y2="9" stroke="#ffffff" strokeWidth="1" />
            </svg>
          </div>
        </footer>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        blocks={blocks}
        config={config}
        posterConfig={posterConfig}
        boxStyles={boxStyles}
        initialTab={exportInitialTab}
      />
    </div>
  );
}

export default App;
