/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BoxCustomStyle, GridBlock, GridConfig, PosterConfig } from '../types/grid';
import {
  generateCSSGrid,
  generateTailwindReact,
  generateSVG,
  generateJSON,
} from '../utils/codeGenerators';
import {
  exportPosterAsPngDataUrl,
  downloadPngFile,
  copyPngToClipboard,
  exportPosterAsWebpDataUrl,
  downloadWebpFile,
  copyWebpToClipboard,
} from '../utils/exportImage';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
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

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  config,
  posterConfig,
  boxStyles,
  initialTab = 'css',
}) => {
  const [activeTab, setActiveTab] = useState<ExportFormatTab>(initialTab);
  const [copied, setCopied] = useState(false);

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
        return generateCSSGrid(blocks, config);
      case 'tailwind':
        return generateTailwindReact(blocks, config);
      case 'svg':
        return generateSVG(blocks, config, posterConfig, boxStyles);
      case 'json':
        return generateJSON(blocks, config);
      default:
        return '';
    }
  };

  const codeContent = getCodeContent();
  const isImageTab = activeTab === 'png' || activeTab === 'webp';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 select-none">
      <div className="win95-window w-full max-w-3xl max-h-[86vh] flex flex-col p-1 text-black">
        {/* Classic Windows 95 Active Title Bar */}
        <div className="win95-titlebar px-2 py-1 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold tracking-wide">
              Export Layout Grid Specification - [{config.algorithm.toUpperCase()} {config.cols}×{config.rows}]
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
        <div className="p-2.5 flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Property Sheet Tabs for Export Formats */}
          <div className="flex items-end px-0.5 shrink-0 flex-wrap">
            {[
              { id: 'css' as const, label: 'CSS Grid (.css)' },
              { id: 'tailwind' as const, label: 'React + Tailwind (.tsx)' },
              { id: 'svg' as const, label: 'SVG Wireframe (.svg)' },
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
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Outset Tab Content Frame */}
          <div className="win95-outset flex-1 min-h-0 flex flex-col p-2.5 gap-2 overflow-hidden">
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

            {!isImageTab && (
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
              {blocks.length} Containers · Seed #{config.seed}
            </div>
            <div className="flex items-center gap-2">
              {!isImageTab && (
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
