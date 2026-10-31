/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LayoutAlgorithmType =
  | 'bsp'
  | 'gorilla-sun'
  | 'gerstner'
  | 'fibonacci'
  | 'hero-anchor'
  | 'guillotine'
  | 'mondrian'
  | 'quadtree-recursive'
  | 'staggered-brick'
  | 'swiss-columnar'
  | 'treemap'
  | 'modular-uniform';

export type PackingBias =
  | 'balanced'
  | 'prefer-wide'
  | 'prefer-tall'
  | 'prefer-large'
  | 'focal-hero';

export type GapFillingStrategy = 'fill-1x1' | 'consolidate' | 'negative-space';

export type FocalLocus =
  | 'top-left'
  | 'center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type ScanDirection = 'row-major' | 'col-major' | 'snake' | 'center-out';

export type SymmetryMode = 'none' | 'bilateral-x' | 'radial';

export type AspectConstraint = 'free' | 'square' | 'golden';

export interface GridSpanCandidate {
  w: number;
  h: number;
  label?: string;
  weight?: number;
}

export type PosterAspectRatio =
  | 'fill-viewport' // Fill entire workspace
  | 'grid-ratio'    // Proportional to active grid cols : rows
  | 'cinema-16x9'   // 16:9
  | 'cinema-16x10'  // 16:10
  | 'landscape-4x3' // 4:3
  | 'A4'            // 1:1.414 (ISO DIN)
  | 'A3'            // 1:1.414
  | 'swiss-70x100'  // 7:10 (Weltformat)
  | 'golden'        // 1:1.618
  | 'square'        // 1:1
  | 'editorial-4x5' // 4:5
  | 'vertical-9x16'; // 9:16

export type ContainerFillMode = 'none' | 'palette-solid' | 'gradient';

export type GradientDirection =
  | 'to-bottom'
  | 'to-right'
  | 'to-bottom-right'
  | 'to-top-right'
  | 'radial';

export type PaletteDistribution =
  | 'random'
  | 'sequential'
  | 'coordinate-x'
  | 'coordinate-y'
  | 'size-based';

export type BrutalistShadowStyle = 'brutalist-hard' | 'deep-drop' | 'win95-bevel' | 'flat-razor';

export interface ContainerColorConfig {
  fillMode: ContainerFillMode;
  schemeId: string;
  gradientDirection: GradientDirection;
  gradientStopOffset: number; // 0 - 100%
  paletteDistribution: PaletteDistribution;
  opacity: number; // 0.1 - 1.0
  invertScheme?: boolean;
  seedOffset?: number;
  containerShadowStyle?: BrutalistShadowStyle;
}

export interface BoxCustomStyle {
  isNegativeVoid?: boolean; // When true, rendered as empty architectural breathing room
  fillColor?: string; // Optional per-box solid color override
  gradientColor1?: string; // Optional per-box gradient start override
  gradientColor2?: string; // Optional per-box gradient end override
  gradientAngle?: number; // Optional per-box gradient angle override
  customLabel?: string;
  customHeadline?: string;
  customSubtitle?: string;
  showBoxTypography?: boolean;
  showBoxMeta?: boolean;
  isLocked?: boolean;
}

export interface PosterConfig {
  aspectRatio: PosterAspectRatio;
  paperOrientation?: 'portrait' | 'landscape';
  marginPadding: number;
  showCropMarks: boolean;
  showGridCoordinates: boolean;
  showPosterHeader: boolean;
  showPosterFooter: boolean;
  showGridGuides?: boolean;
  showCrosshairs?: boolean;
  showBoxHeadlines: boolean;
  showBoxMetadata: boolean;
  showAllTypography?: boolean;
  showGridLines?: boolean;
  gridBorderWidth?: number;
  typeInformationLevel?: 'minimal' | 'standard' | 'full';
  colorConfig?: ContainerColorConfig;
}

export interface GridBlock {
  id: string;
  col: number; // 0-indexed column
  row: number; // 0-indexed row
  colSpan: number;
  rowSpan: number;
  order: number;
  isGapFill?: boolean;
  algorithmOrigin?: LayoutAlgorithmType;
  componentType?:
    | 'hero'
    | 'metric'
    | 'feature'
    | 'quote'
    | 'media'
    | 'cta'
    | 'tech'
    | 'avatar'
    | 'article'
    | 'compact';
  depth?: number;
  customStyle?: BoxCustomStyle;
}

export interface GridConfig {
  algorithm: LayoutAlgorithmType;
  cols: number;
  rows: number;
  maxColSpan: number;
  maxRowSpan: number;
  minColSpan: number;
  minRowSpan: number;
  gap: number;
  borderRadius: number;
  bias: PackingBias;
  gapStrategy: GapFillingStrategy;
  seed: number;
  allowedSpans: string[];
  bspDepth: number;
  bspSplitVariance: number;
  focalLocus: FocalLocus;
  gerstnerModuleBase: number;
  voidDensity?: number;
  scanDirection?: ScanDirection;
  symmetryMode?: SymmetryMode;
  aspectConstraint?: AspectConstraint;
}

export type StepActionType =
  | 'init'
  | 'inspect-cell'
  | 'testing-candidate'
  | 'collision-detected'
  | 'out-of-bounds'
  | 'block-placed'
  | 'bsp-split'
  | 'fibonacci-carve'
  | 'gap-fill-start'
  | 'gap-fill-placed'
  | 'completed';

export interface AlgorithmicStep {
  stepIndex: number;
  action: StepActionType;
  currentCell: { x: number; y: number } | null;
  candidateSpan?: { w: number; h: number };
  collidingCell?: { x: number; y: number };
  booleanGrid: boolean[][];
  placedBlocks: GridBlock[];
  description: string;
  codeHighlightLine?: number;
}

export interface GridStats {
  algorithmName: string;
  totalCells: number;
  occupiedCells: number;
  fillPercentage: number;
  blockCount: number;
  avgColSpan: number;
  avgRowSpan: number;
  gapFillsCount: number;
  primaryBlocksCount: number;
  largestBlock: { w: number; h: number };
  timeComplexity: string;
}

export interface VariationSnapshot {
  id: string;
  name: string;
  timestamp: number;
  seed: number;
  config: GridConfig;
  posterConfig: PosterConfig;
  boxStyles: Record<string, BoxCustomStyle>;
}
