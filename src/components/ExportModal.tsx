/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BoxCustomStyle, GridBlock, GridConfig, PosterConfig } from '../types/grid';
import {
  generateCSSGrid,
  generateTailwindReact,
  generateSVG,
  generateJSON,
  PrintExportOptions,
} from '../utils/codeGenerators';
import {
  exportPosterAsPngDataUrl,
  downloadPngFile,
  copyPngToClipboard,
  exportPosterAsWebpDataUrl,
  downloadWebpFile,
  copyWebpToClipboard,
  downloadSvgFile,
  rasterizeSvgToPng,
} from '../utils/exportImage';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Printer,
  FileCheck,
} from 'lucide-react';
import { ExportFormatTab } from './Header';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: GridBlock[];
  config: GridConfig;
  posterConfig?: PosterConfig;
  boxStyles?: Record<string, BoxCustomStyle>;
  initialTab?: ExportFormatTab;
}

const PRINT_PRESETS: {
  id: 'A0' | 'A1' | 'A2' | 'A3' | '24x36' | '36x48';
  name: string;
  metric: string;
  imperial: string;
  pixels300Dpi: string;
}[] = [
  { id: 'A0', name: 'ISO A0 Exhibition Poster', metric: '841 × 1189 mm', imperial: '33.1 × 46.8 in', pixels300Dpi: '9,933 × 14,043 px' },
  { id: 'A1', name: 'ISO A1 Gallery Poster', metric: '594 × 841 mm', imperial: '23.4 × 33.1 in', pixels300Dpi: '7,016 × 9,933 px' },
  { id: 'A2', name: 'ISO A2 Medium Poster', metric: '420 × 594 mm', imperial: '16.5 × 23.4 in', pixels300Dpi: '4,960 × 7,016 px' },
  { id: '24x36', name: '24 × 36 in Standard Exhibition', metric: '610 × 914 mm', imperial: '24.0 × 36.0 in', pixels300Dpi: '7,200 × 10,800 px' },
  { id: '36x48', name: 'US Architectural E (Large)', metric: '914 × 1219 mm', imperial: '36.0 × 48.0 in', pixels300Dpi: '10,800 × 14,400 px' },
  { id: 'A3', name: 'ISO A3 Art Print', metric: '297 × 420 mm', imperial: '11.7 × 16.5 in', pixels300Dpi: '3,508 × 4,960 px' },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  config,
  posterConfig,
  boxStyles,
  initialTab = 'print',
}) => {
  const [activeTab, setActiveTab] = useState<ExportFormatTab>(initialTab);
  const [copied, setCopied] = useState(false);

  // Large Scale Print Options
  const [printSize, setPrintSize] = useState<'A0' | 'A1' | 'A2' | 'A3' | '24x36' | '36x48'>('A1');
  const [printDpi, setPrintDpi] = useState<150 | 300 | 600>(300);
  const [includeCropMarks, setIncludeCropMarks] = useState<boolean>(true);
  const [includeBleed, setIncludeBleed] = useState<boolean>(true);
  const [paperColor, setPaperColor] = useState<string>('#FFFFFF');
  const [isRenderingPrintRaster, setIsRenderingPrintRaster] = useState<boolean>(false);

  const [pngScale, setPngScale] = useState<number>(2);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);

  const [webpScale, setWebpScale] = useState<number>(2);
  const [webpDataUrl, setWebpDataUrl] = useState<string | null>(null);
  const [isGeneratingWebp, setIsGeneratingWebp] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const currentPrintPreset = useMemo(
    () => PRINT_PRESETS.find((p) => p.id === printSize) || PRINT_PRESETS[0],
    [printSize]
  );

  const printOptions: PrintExportOptions = useMemo(
    () => ({
      paperSize: printSize,
      dpi: printDpi,
      includeCropMarks,
      includeBleed,
      paperColor,
    }),
    [printSize, printDpi, includeCropMarks, includeBleed, paperColor]
  );

  const printSvgContent = useMemo(
    () => generateSVG(blocks, config, posterConfig, boxStyles, printOptions),
    [blocks, config, posterConfig, boxStyles, printOptions]
  );

  const renderPng = useCallback(
    async (scale: number) => {
      setIsGeneratingPng(true);
      try {
        await new Promise((r) => setTimeout(r, 40));
        const dataUrl = await exportPosterAsPngDataUrl(
          'poster-artwork-node',
          {
            pixelRatio: scale,
            backgroundColor: '#FFFFFF',
          },
          posterConfig ? { blocks, config, posterConfig, boxStyles } : undefined
        );
        setPngDataUrl(dataUrl);
      } catch (err) {
        console.error('PNG export failed:', err);
      } finally {
        setIsGeneratingPng(false);
      }
    },
    [blocks, config, posterConfig, boxStyles]
  );

  const renderWebp = useCallback(
    async (scale: number) => {
      setIsGeneratingWebp(true);
      try {
        await new Promise((r) => setTimeout(r, 40));
        const dataUrl = await exportPosterAsWebpDataUrl(
          'poster-artwork-node',
          {
            pixelRatio: scale,
            quality: 0.92,
            backgroundColor: '#FFFFFF',
          },
          posterConfig ? { blocks, config, posterConfig, boxStyles } : undefined
        );
        setWebpDataUrl(dataUrl);
      } catch (err) {
        console.error('WebP export failed:', err);
      } finally {
        setIsGeneratingWebp(false);
      }
    },
    [blocks, config, posterConfig, boxStyles]
  );

  useEffect(() => {
    if (isOpen && activeTab === 'png') {
      renderPng(pngScale);
    } else if (isOpen && activeTab === 'webp') {
      renderWebp(webpScale);
    }
  }, [isOpen, activeTab, pngScale, webpScale, renderPng, renderWebp]);

  if (!isOpen) return null;

  const getCodeContent = () => {
    switch (activeTab) {
      case 'css':
        return generateCSSGrid(blocks, config, posterConfig, boxStyles);
      case 'tailwind':
        return generateTailwindReact(blocks, config, posterConfig, boxStyles);
      case 'svg':
        return generateSVG(blocks, config, posterConfig, boxStyles);
      case 'json':
        return generateJSON(blocks, config, posterConfig, boxStyles);
      case 'print':
        return printSvgContent;
      default:
        return '';
    }
  };

  const codeContent = getCodeContent();
  const isImageTab = activeTab === 'png' || activeTab === 'webp';
  const isPrintTab = activeTab === 'print';

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const ext =
      activeTab === 'css'
        ? 'css'
        : activeTab === 'tailwind'
        ? 'tsx'
        : activeTab === 'svg'
        ? 'svg'
        : 'json';
    const mime =
      activeTab === 'svg'
        ? 'image/svg+xml'
        : activeTab === 'json'
        ? 'application/json'
        : 'text/plain';
    const blob = new Blob([codeContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-${config.algorithm}-${config.cols}x${config.rows}-${config.seed}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPrintSvg = () => {
    downloadSvgFile(
      printSvgContent,
      `large-scale-print-${printSize}-${printDpi}dpi-${config.algorithm}-${config.cols}x${config.rows}.svg`
    );
  };

  const handleDownloadPrintRaster = async () => {
    setIsRenderingPrintRaster(true);
    try {
      const scaleMultiplier = printDpi === 600 ? 4 : printDpi === 300 ? 2.5 : 1.5;
      const dataUrl = await rasterizeSvgToPng(
        blocks,
        config,
        posterConfig || {
          aspectRatio: 'grid-ratio',
          marginPadding: 28,
          showCropMarks: true,
          showGridCoordinates: true,
          showPosterHeader: false,
          showPosterFooter: false,
          showBoxHeadlines: false,
          showBoxMetadata: false,
        },
        boxStyles,
        scaleMultiplier
      );
      downloadPngFile(
        dataUrl,
        `large-scale-print-${printSize}-${printDpi}dpi-${config.algorithm}-${config.cols}x${config.rows}.png`
      );
    } catch (err) {
      console.error('Print raster export failed:', err);
    } finally {
      setIsRenderingPrintRaster(false);
    }
  };

  const handleTriggerBrowserPrint = () => {
    // Open printable vector popup or trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Large Scale Print - ${printSize}</title>
            <style>
              @page { size: auto; margin: 0mm; }
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #ffffff; }
              svg { width: 100vw; height: 100vh; max-width: 100%; max-height: 100%; }
            </style>
          </head>
          <body>
            ${printSvgContent}
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 select-none">
      <div className="win95-window w-full max-w-4xl max-h-[88vh] flex flex-col p-1 text-black">
        {/* Classic Windows 95 Active Title Bar */}
        <div className="win95-titlebar px-2 py-1 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold tracking-wide">
              Print & Export Manager - [{config.algorithm.toUpperCase()} {config.cols}×{config.rows}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="win95-btn w-4 h-4 flex items-center justify-center text-[10px] font-bold text-black leading-none"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-2 flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Windows 95 Property Sheet Tabs */}
          <div className="flex items-end px-0.5 shrink-0 flex-wrap">
            {[
              { id: 'print' as const, label: 'Large Scale Print', isHighlight: true },
              { id: 'css' as const, label: 'CSS Grid (.css)' },
              { id: 'tailwind' as const, label: 'React + Tailwind (.tsx)' },
              { id: 'svg' as const, label: 'Vector SVG (.svg)' },
              { id: 'png' as const, label: 'PNG Bitmap (.png)' },
              { id: 'webp' as const, label: 'WebP Image (.webp)' },
              { id: 'json' as const, label: 'JSON Schema (.json)' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold win95-tab ${
                    active ? 'win95-tab-active' : 'text-[#222222]'
                  } ${tab.isHighlight && !active ? 'text-[#000080]' : ''}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Outset Tab Content Frame */}
          <div className="win95-outset flex-1 min-h-0 flex flex-col p-2.5 gap-2 overflow-hidden">
            {/* ========================================================= */}
            {/* LARGE SCALE PRINT TAB                                     */}
            {/* ========================================================= */}
            {isPrintTab && (
              <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2.5 overflow-hidden">
                {/* Print Settings Left Panel */}
                <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
                  {/* Paper Format Groupbox */}
                  <fieldset className="win95-groupbox p-2 space-y-1.5">
                    <legend className="font-bold">Paper Format & Dimensions</legend>
                    <div className="space-y-1">
                      {PRINT_PRESETS.map((preset) => (
                        <label
                          key={preset.id}
                          className={`flex items-start gap-1.5 p-1 cursor-pointer text-[11px] rounded ${
                            printSize === preset.id ? 'bg-[#000080] text-white' : 'hover:bg-[#dfdfdf]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="printSize"
                            checked={printSize === preset.id}
                            onChange={() => setPrintSize(preset.id)}
                            className="mt-0.5 accent-[#000080]"
                          />
                          <div className="min-w-0">
                            <div className="font-bold leading-tight">{preset.name}</div>
                            <div className="text-[10px] font-mono-code opacity-80">
                              {preset.metric} ({preset.imperial})
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Resolution & DPI Groupbox */}
                  <fieldset className="win95-groupbox p-2 space-y-2">
                    <legend className="font-bold">Resolution & DPI</legend>
                    <div className="grid grid-cols-3 gap-1">
                      {([150, 300, 600] as const).map((dpi) => (
                        <button
                          key={dpi}
                          onClick={() => setPrintDpi(dpi)}
                          className={`py-1 text-[11px] font-mono-code ${
                            printDpi === dpi ? 'win95-btn-latched' : 'win95-btn'
                          }`}
                        >
                          {dpi} DPI
                        </button>
                      ))}
                    </div>
                    <div className="win95-inset p-1.5 text-[10px] font-mono-code bg-[#f0f0f0] space-y-0.5">
                      <div>Format: {currentPrintPreset.name}</div>
                      <div>DPI Standard: {printDpi} Dots/Inch</div>
                      <div className="font-bold text-[#000080]">
                        Pixels: {currentPrintPreset.pixels300Dpi}
                      </div>
                    </div>
                  </fieldset>

                  {/* Production Guides Groupbox */}
                  <fieldset className="win95-groupbox p-2 space-y-1.5">
                    <legend className="font-bold">Printer Marks & Bleed</legend>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={includeCropMarks}
                        onChange={(e) => setIncludeCropMarks(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#000080]"
                      />
                      <span>Print Corner Crop / Trim Marks</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={includeBleed}
                        onChange={(e) => setIncludeBleed(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#000080]"
                      />
                      <span>Include 3mm Outer Bleed Area</span>
                    </label>

                    <div className="pt-1">
                      <div className="text-[11px] mb-1">Paper Stock Finish:</div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: '#FFFFFF', label: 'Pure White' },
                          { id: '#F6F4EB', label: 'Archival Cream' },
                          { id: '#18181B', label: 'Matte Dark' },
                        ].map((paper) => (
                          <button
                            key={paper.id}
                            onClick={() => setPaperColor(paper.id)}
                            className={`py-1 text-[10px] ${
                              paperColor === paper.id ? 'win95-btn-latched' : 'win95-btn'
                            }`}
                          >
                            {paper.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                </div>

                {/* Print Preview Right Panel */}
                <div className="flex-1 min-h-[300px] flex flex-col gap-2 overflow-hidden">
                  <div className="win95-inset bg-[#808080] flex-1 flex items-center justify-center p-3 overflow-auto">
                    <div
                      className="max-h-[380px] w-auto bg-white p-2 flex items-center justify-center shadow-lg"
                      style={{ boxShadow: '4px 4px 0px #000000' }}
                      dangerouslySetInnerHTML={{ __html: printSvgContent }}
                    />
                  </div>

                  {/* Print Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      onClick={handleTriggerBrowserPrint}
                      className="win95-btn px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#000080]" />
                      <span>Print via System Dialog...</span>
                    </button>
                    <button
                      onClick={handleDownloadPrintRaster}
                      disabled={isRenderingPrintRaster}
                      className="win95-btn px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isRenderingPrintRaster ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#000080]" />
                          <span>Generating Print Raster...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Save {printDpi} DPI Print PNG</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadPrintSvg}
                      className="win95-btn px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 text-[#000080]"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Download Lossless Vector SVG ({printSize})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* PNG BITMAP TAB                                            */}
            {/* ========================================================= */}
            {activeTab === 'png' && (
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold">Bitmap Scale:</span>
                    {[1, 2, 3, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPngScale(s)}
                        className={`px-2 py-0.5 text-[11px] font-mono-code ${
                          pngScale === s ? 'win95-btn-latched' : 'win95-btn'
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => pngDataUrl && copyPngToClipboard(pngDataUrl)}
                      disabled={!pngDataUrl || isGeneratingPng}
                      className="win95-btn px-2.5 py-1 text-[11px] disabled:opacity-50"
                    >
                      Copy Bitmap
                    </button>
                    <button
                      onClick={() =>
                        pngDataUrl &&
                        downloadPngFile(
                          pngDataUrl,
                          `layout-${config.algorithm}-${config.cols}x${config.rows}-${config.seed}.png`
                        )
                      }
                      disabled={!pngDataUrl || isGeneratingPng}
                      className="win95-btn px-3 py-1 text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save PNG...</span>
                    </button>
                  </div>
                </div>

                <div className="win95-inset bg-[#808080] flex-1 min-h-[280px] flex items-center justify-center p-4 overflow-auto">
                  {isGeneratingPng ? (
                    <div className="win95-window px-4 py-2 flex items-center gap-2 text-[11px]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#000080]" />
                      <span>Rendering {pngScale}× Bitmap...</span>
                    </div>
                  ) : pngDataUrl ? (
                    <img
                      src={pngDataUrl}
                      alt="Layout PNG Preview"
                      className="max-h-[360px] w-auto object-contain bg-white"
                      style={{ boxShadow: '4px 4px 0px #000000' }}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* WEBP BITMAP TAB                                           */}
            {/* ========================================================= */}
            {activeTab === 'webp' && (
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold">WebP Scale:</span>
                    {[1, 2, 3, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setWebpScale(s)}
                        className={`px-2 py-0.5 text-[11px] font-mono-code ${
                          webpScale === s ? 'win95-btn-latched' : 'win95-btn'
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => webpDataUrl && copyWebpToClipboard(webpDataUrl)}
                      disabled={!webpDataUrl || isGeneratingWebp}
                      className="win95-btn px-2.5 py-1 text-[11px] disabled:opacity-50"
                    >
                      Copy WebP
                    </button>
                    <button
                      onClick={() =>
                        webpDataUrl &&
                        downloadWebpFile(
                          webpDataUrl,
                          `layout-${config.algorithm}-${config.cols}x${config.rows}-${config.seed}.webp`
                        )
                      }
                      disabled={!webpDataUrl || isGeneratingWebp}
                      className="win95-btn px-3 py-1 text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save WebP...</span>
                    </button>
                  </div>
                </div>

                <div className="win95-inset bg-[#808080] flex-1 min-h-[280px] flex items-center justify-center p-4 overflow-auto">
                  {isGeneratingWebp ? (
                    <div className="win95-window px-4 py-2 flex items-center gap-2 text-[11px]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#000080]" />
                      <span>Rendering {webpScale}× WebP...</span>
                    </div>
                  ) : webpDataUrl ? (
                    <img
                      src={webpDataUrl}
                      alt="Layout WebP Preview"
                      className="max-h-[360px] w-auto object-contain bg-white"
                      style={{ boxShadow: '4px 4px 0px #000000' }}
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* CODE TABS: CSS / TAILWIND / SVG / JSON                    */}
            {/* ========================================================= */}
            {!isImageTab && !isPrintTab && (
              <div className="win95-inset flex-1 min-h-[300px] p-2.5 overflow-auto bg-white text-black">
                <pre className="text-[11px] font-mono-code leading-relaxed whitespace-pre">
                  {codeContent}
                </pre>
              </div>
            )}
          </div>

          {/* Bottom Dialog Command Buttons */}
          <div className="flex items-center justify-between pt-1 shrink-0">
            <div className="text-[11px] font-mono-code text-[#404040]">
              {blocks.length} Containers · Scheme: {posterConfig?.colorConfig?.schemeId || 'Default'} · Seed #{config.seed}
            </div>
            <div className="flex items-center gap-2">
              {!isImageTab && !isPrintTab && (
                <>
                  <button
                    onClick={handleCopyCode}
                    className="win95-btn px-3 py-1 text-[11px] flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#008000]" />
                        <span className="font-bold text-[#008000]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadCode}
                    className="win95-btn px-3 py-1 text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save File...</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="win95-btn px-4 py-1 text-[11px] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
