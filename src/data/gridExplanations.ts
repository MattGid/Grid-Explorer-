/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutAlgorithmType } from '../types/grid';

export interface AlgorithmExplanation {
  id: LayoutAlgorithmType;
  name: string;
  shortTag: string;
  pioneer: string;
  year: string;
  category: 'Spatial Partitioning' | 'Stochastic Packing' | 'Harmonic Modularity' | 'Geometric Dissection' | 'Editorial Systems';
  whatIsIt: string;
  mechanics: string;
  designTheory: string;
  bestFor: string;
  timeComplexity: string;
  surfaceCoverage: string;
  keyProperties: string[];
}

export const GRID_ALGORITHM_INFO: Record<LayoutAlgorithmType, AlgorithmExplanation> = {
  bsp: {
    id: 'bsp',
    name: 'Recursive BSP Tree',
    shortTag: 'Binary Space Partitioning',
    pioneer: 'John von Neumann & Computer Graphics Pioneers',
    year: '1969 / 1980',
    category: 'Spatial Partitioning',
    whatIsIt:
      'A hierarchical slicing-tree algorithm that begins with the entire poster viewport as a single root node and recursively cuts it with orthogonal planes (vertical or horizontal lines). Every cut divides a rectangular module into two smaller non-overlapping child modules until the target recursion depth or minimum module dimension is reached.',
    mechanics:
      'Starting with the root bounding rectangle [0, 0, W, H], the algorithm alternates vertical and horizontal partition planes. At each step, a split plane position is computed using an adjustable variance around the bisector (or golden ratio 0.618). Terminal leaves of the tree directly become the poster’s modular blocks, guaranteeing mathematical zero-overlap and 100% surface utilization.',
    designTheory:
      'Directly echoes Piet Mondrian’s neoplastic orthogonal divisions and Josef Müller-Brockmann’s structured visual order. Because splits cascade hierarchically, large dominant macro-zones naturally coexist with clusters of high-density micro-modules, creating effortless typographic contrast.',
    bestFor:
      'High-impact exhibition posters, architectural monographs, complex infographics, and multi-scale brutalist compositions.',
    timeComplexity: 'O(N log N)',
    surfaceCoverage: '100% (Zero leftover voids)',
    keyProperties: ['Hierarchical Tree', '100% Surface Coverage', 'Zero Overlap', 'Scale Invariance'],
  },
  'gorilla-sun': {
    id: 'gorilla-sun',
    name: 'Gorilla Sun Matrix Packing',
    shortTag: 'Boolean Occupancy Scan',
    pioneer: 'Ahmad Moussa (Gorilla Sun)',
    year: '2021',
    category: 'Stochastic Packing',
    whatIsIt:
      'A generative pseudo-packing algorithm popularized by computational artist Ahmad Moussa. It scans a discrete 2D Boolean occupancy grid cell by cell, attempting to place randomly selected multi-span rectangles from a permitted candidate set without colliding with already-occupied cells.',
    mechanics:
      'A 2D Boolean matrix (cols × rows) tracks occupied coordinates (false = free, true = occupied). The scanner visits every free cell in the chosen order (e.g. left-to-right, top-to-bottom), shuffles permitted rectangular spans (e.g., 2×1, 2×2, 4×2), checks if all cells within the candidate bounding box are vacant and within grid boundaries, stamps the block as occupied, and repeats. Leftover 1×1 cells can be filled, consolidated, or retained as negative breathing voids.',
    designTheory:
      'Embraces generative entropy within discrete bounds. It mirrors the physical letterpress typesetter’s chase, where metal type slugs and wooden spacing furniture are locked into place under tight physical boundaries.',
    bestFor:
      'Dynamic bento grids, tactile generative art prints, brutalist rhythm posters, and varied modular content blocks.',
    timeComplexity: 'O(W × H × (w × h))',
    surfaceCoverage: '92% - 100% (Depends on gap strategy)',
    keyProperties: ['Stochastic Variety', 'Bento Rhythm', 'Candidate Controlled', 'Tactile Density'],
  },
  gerstner: {
    id: 'gerstner',
    name: 'Karl Gerstner Compound Grid',
    shortTag: 'Designing Programmes (1964)',
    pioneer: 'Karl Gerstner (Basel School)',
    year: '1964',
    category: 'Harmonic Modularity',
    whatIsIt:
      'The pinnacle of Swiss graphic design theory. In his seminal 1964 treatise "Designing Programmes", Swiss designer Karl Gerstner created a compound grid based on the number 12 (and 58 modules). Because 12 is divisible by 2, 3, 4, and 6, a single grid framework can be simultaneously partitioned into halves, thirds, quarters, and sixths without structural conflict.',
    mechanics:
      'The base column field is structured as a highly divisible modular integer (typically 12, 16, or 24 units). In each horizontal band, the algorithm selects harmonic divisor fractions (e.g., 1/2 = 6 cols, 1/3 = 4 cols, 1/4 = 3 cols, 2/3 = 8 cols, 3/4 = 9 cols) that sum precisely to the total width. This creates interlocking proportional relationships across successive horizontal tiers.',
    designTheory:
      'Replaces arbitrary aesthetic whims with a coherent mathematical system. Gerstner called this "programming the design": the rules of harmonic division guarantee that all elements share proportional DNA while allowing hundreds of varied layouts.',
    bestFor:
      'International Typographic Style (Swiss Style) posters, corporate identity manuals, museum catalogs, and clean typographic monographs.',
    timeComplexity: 'O(W × H)',
    surfaceCoverage: '100% (Harmonic sum)',
    keyProperties: ['Swiss Rationalism', 'Divisor Harmonics (1/2, 1/3, 1/4)', 'Rigorous Alignment', 'Karl Gerstner 1964'],
  },
  fibonacci: {
    id: 'fibonacci',
    name: 'Fibonacci Golden Spiral',
    shortTag: 'Logarithmic Phi Dissection',
    pioneer: 'Leonardo Fibonacci & Renaissance Geometers',
    year: '1202 / 1509 (Pacioli)',
    category: 'Geometric Dissection',
    whatIsIt:
      'An organic geometric dissection algorithm that recursively carves out dominant golden rectangles from rotating edges of the canvas according to the golden ratio (φ ≈ 1.6180339887). As each quadrant is carved, the remaining bounding box retains golden proportion, winding inward towards an optical focal vortex.',
    mechanics:
      'Starting with the full canvas bounding box, the algorithm computes a cut of width or height equal to round(box_dimension × 0.618). It extracts this prominent rectangle along edge 0 (Left), updates the remaining box, then extracts the next rectangle along edge 1 (Top), edge 2 (Right), and edge 3 (Bottom) in a clockwise rotational spiral until the remaining core is reached.',
    designTheory:
      'Reflects the logarithmic spirals found in chambered nautilus shells, sunflower seed distributions, and classical Greek architecture (the Parthenon). The viewer’s eye is naturally drawn into the spiral toward the golden focal point, establishing an unmistakable ocular hierarchy.',
    bestFor:
      'Hero-focused editorial covers, exhibition announcements, poetic minimalism, and fine art gallery prints.',
    timeComplexity: 'O(log(W × H))',
    surfaceCoverage: '100% (Exact recursive dissection)',
    keyProperties: ['Golden Ratio φ (1.618)', 'Logarithmic Vortex', 'Ocular Trajectory', 'Natural Harmony'],
  },
  'hero-anchor': {
    id: 'hero-anchor',
    name: 'Asymmetric Focal Hero Anchor',
    shortTag: 'Flagship Dominance & Periphery',
    pioneer: 'Bauhaus & Modernist Editorial Design',
    year: '1925',
    category: 'Editorial Systems',
    whatIsIt:
      'An asymmetric layout framework that deliberately establishes a single monumentally sized "Hero Anchor" block at an intentional focal locus (such as the top-left or center), and then organizes secondary and tertiary modular support blocks in the remaining peripheral quadrant.',
    mechanics:
      'The engine first places a dominant hero block spanning 55% to 65% of the total grid area at the chosen focal locus (Top-Left, Center, Top-Right, Bottom-Left, or Bottom-Right). It marks this space as occupied on the Boolean grid. The remaining L-shaped or peripheral unoccupied territory is then packed using greedy directional shelf packing with constrained secondary aspect ratios.',
    designTheory:
      'Applies the Gestalt psychology law of figure-ground segregation and visual weight. By creating an unmistakable hierarchy between the primary hero module (for bold headlines or key photography) and supporting modules (for metadata, captions, and metrics), reading fatigue is eliminated.',
    bestFor:
      'Magazine cover designs, product launch keynotes, festival headliner lineups, and narrative storytelling.',
    timeComplexity: 'O(W × H)',
    surfaceCoverage: '95% - 100%',
    keyProperties: ['Gestalt Dominance', 'Clear 1st/2nd/3rd Read', 'Asymmetrical Balance', 'Flagship Hero'],
  },
  guillotine: {
    id: 'guillotine',
    name: 'Guillotine Cut Shelf Packing',
    shortTag: 'Industrial Cutting-Stock Model',
    pioneer: 'Industrial Operations Research & P.C. Gilmore',
    year: '1961',
    category: 'Spatial Partitioning',
    whatIsIt:
      'Inspired by the industrial guillotine paper-cutting shears used in print shops, where every single cut must proceed completely across the sheet from one edge to the opposite edge. The algorithm creates continuous horizontal "shelves" or vertical bands and slices them into discrete modular containers.',
    mechanics:
      'The layout proceeds vertically: a horizontal shelf of height H (1, 2, or 3 rows) is sliced completely from the left boundary to the right boundary. Inside this shelf, vertical guillotine cuts of variable widths (e.g. 2, 3, 4 columns) are made from top to bottom. Once the shelf is exhausted, the blade cuts the next shelf until the grid height is filled.',
    designTheory:
      'Echoes the clean, continuous baseline rhythms of classic Swiss grid systems (Emil Ruder and Armin Hofmann). Horizontal bands allow distinct thematic chapters or headlines to run without visual interruption across the page.',
    bestFor:
      'Technical specification sheets, tabular exhibition programs, line-item schedules, and rhythmic typographic posters.',
    timeComplexity: 'O(N)',
    surfaceCoverage: '100% (Continuous slicing)',
    keyProperties: ['Edge-to-Edge Cuts', 'Continuous Baselines', 'Industrial Rhythm', 'Zero Visual Tangling'],
  },
  mondrian: {
    id: 'mondrian',
    name: 'De Stijl Mondrian Dissection',
    shortTag: 'Neoplastic Orthogonal Balance',
    pioneer: 'Piet Mondrian & Theo van Doesburg (De Stijl)',
    year: '1917 / 1921',
    category: 'Geometric Dissection',
    whatIsIt:
      'An artistic geometric dissection algorithm derived from Piet Mondrian’s iconic Neo-Plasticist compositions (Composition with Red, Blue, and Yellow). It uses bold orthogonal dividing lines, extreme asymmetric weight distribution, and contrast between monolithic fields and compact counterweight blocks.',
    mechanics:
      'The canvas is divided by primary structural axes into 3 to 5 dominant unequal quadrants. Key intersection points are recursively subdivided while other large fields remain unbroken monolithic blocks. Secondary cuts are constrained so that line intersections create the characteristic De Stijl balance of tension and equilibrium.',
    designTheory:
      'De Stijl sought universal harmony through pure abstraction: vertical lines represent vitality and spiritual aspiration, horizontal lines represent calm and earthly rest. Balance is achieved not through symmetry, but through the dynamic equilibrium of unequal colored rectangles.',
    bestFor:
      'Brutalist cultural posters, museum exhibitions, avant-garde music festivals, and high-contrast color block designs.',
    timeComplexity: 'O(N log N)',
    surfaceCoverage: '100%',
    keyProperties: ['Neo-Plasticism (De Stijl)', 'Dynamic Equilibrium', 'Asymmetric Counterweights', 'Bold Orthogonal Axes'],
  },
  'quadtree-recursive': {
    id: 'quadtree-recursive',
    name: 'Adaptive Quadtree Subdivision',
    shortTag: 'Hierarchical 4-Quadrant Recursion',
    pioneer: 'Raphael Finkel & J.L. Bentley (Spatial Indexing)',
    year: '1974',
    category: 'Spatial Partitioning',
    whatIsIt:
      'A multi-resolution 2D spatial tree structure that recursively decomposes any node into four equal or variable sub-quadrants (NW, NE, SW, SE). When paired with a stochastic depth trigger, it generates mesmerizing multi-scale cellular grids where coarse and fine densities coexist harmoniously.',
    mechanics:
      'Beginning with the whole canvas, each cell evaluates whether to subdivide into 4 sub-quadrants based on the current depth and random threshold. Subdivisions repeat down to the maximum recursion depth, creating clusters of 1×1 micro-cells nested directly beside 2×2 or 4×4 parent macro-blocks.',
    designTheory:
      'Mirrors cellular mitosis and architectural fractal geometry. Quadtrees naturally create self-similar visual rhythms at multiple scales (macro, meso, micro), satisfying both far-distance viewing and close-up detail inspection.',
    bestFor:
      'Generative code art, multi-tier data dashboards, experimental music packaging, and complex modular identity systems.',
    timeComplexity: 'O(4^D) where D is depth',
    surfaceCoverage: '100%',
    keyProperties: ['Recursive 4-Way Splitting', 'Multi-Scale Cellular Density', 'Self-Similarity', 'High-Frequency Detail'],
  },
  'staggered-brick': {
    id: 'staggered-brick',
    name: 'Tessellated Masonry & Staggered Brickwork',
    shortTag: 'Architectural Running Bond',
    pioneer: 'Roman & Bauhaus Architectural Masonry',
    year: 'Classical Antiquity / Bauhaus 1923',
    category: 'Harmonic Modularity',
    whatIsIt:
      'A tectonic layout algorithm that mimics architectural masonry bonds (running bond, Flemish bond, or modular brickwork). Alternating rows are offset horizontally by a phase shift (typically 50% or 1/3 of a module), eliminating monotonous continuous vertical seams and creating dynamic structural tension.',
    mechanics:
      'Rows are generated sequentially. Even-numbered rows start at column 0, while odd-numbered rows introduce a half-module or fractional offset block at the edge. Modules within each row then stretch across 2, 3, or 4 columns. Vertical joints never align continuously across more than two tiers, mimicking structural masonry load paths.',
    designTheory:
      'In structural architecture, overlapping bricks distribute loads and prevent vertical shearing. In graphic design, this masonry stagger guides the eye diagonally across the poster, creating a fluid, rhythmic reading cadence rather than rigid rectangular columns.',
    bestFor:
      'Architectural biennales, typographic texture posters, industrial product showcases, and kinetic typographic displays.',
    timeComplexity: 'O(W × H)',
    surfaceCoverage: '100%',
    keyProperties: ['Offset Seams', 'Tectonic Masonry Rhythm', 'Diagonal Eye Movement', 'Structural Stability'],
  },
  'swiss-columnar': {
    id: 'swiss-columnar',
    name: 'Swiss Columnar Typographic System',
    shortTag: '12-Column Modernist Baseline',
    pioneer: 'Josef Müller-Brockmann & Max Bill',
    year: '1955 / 1981',
    category: 'Editorial Systems',
    whatIsIt:
      'The classic 12-column and 16-column layout grid formulated by the Swiss School (Zurich and Basel) for editorial publishing, books, and public posters. Standardized column units allow headlines to span 8 or 12 columns, body text to span 4 or 6 columns, and marginalia captions to occupy single 2-column tracks.',
    mechanics:
      'Columns are grouped into standardized modular spans: 12-column grids cleanly support 1-col (margin/index), 2-col (caption), 3-col (quarter), 4-col (one-third), 6-col (half), 8-col (two-thirds), and 12-col (full-bleed banner) modules. The algorithm generates balanced typographic tiers honoring standard Swiss editorial spans.',
    designTheory:
      'As Müller-Brockmann wrote: "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style." It instills order, legibility, and objective clarity into complex information.',
    bestFor:
      'Pure Swiss typography posters, editorial essays, academic journals, annual reports, and information design.',
    timeComplexity: 'O(W × H)',
    surfaceCoverage: '100%',
    keyProperties: ['12-Column Division', 'Standardized Typographic Measures', 'Müller-Brockmann Heritage', 'Objective Clarity'],
  },
  treemap: {
    id: 'treemap',
    name: 'Squarified Golden Treemap',
    shortTag: 'Area-Weighted Proportional Slicing',
    pioneer: 'Ben Shneiderman & Bruls / Huizing / van Wijk',
    year: '1991 / 2000',
    category: 'Spatial Partitioning',
    whatIsIt:
      'An information-visualization algorithm that displays hierarchical data as a set of nested rectangles. Unlike raw slice-and-dice treemaps that produce thin, unreadable slivers, the squarified treemap algorithm optimizes the aspect ratio of each rectangle towards 1:1 (square) or 1:1.618 (golden proportion).',
    mechanics:
      'A set of weights (derived from a Fibonacci sequence or power-law distribution) determines the target area of each module. The algorithm packs rectangles row-by-row into a container, dynamically testing whether adding a rectangle to the current row improves or degrades the worst aspect ratio. Once the optimal aspect ratio is reached, a guillotine cut seals the row and recursion continues in the remaining space.',
    designTheory:
      'Bridges data visualization and graphic arts. Every module’s visual footprint corresponds to mathematical hierarchy. Wide aspect ratio distortions are mathematically eliminated, ensuring comfortable typographic reading surfaces within every block.',
    bestFor:
      'Data-driven graphic posters, scientific conference visuals, financial metrics posters, and algorithmic information art.',
    timeComplexity: 'O(N log N)',
    surfaceCoverage: '100%',
    keyProperties: ['Proportional Area Weighting', 'Squarified Aspect Ratios', 'Zero Slivers', 'Data-Art Fusion'],
  },
  'modular-uniform': {
    id: 'modular-uniform',
    name: 'Josef Müller-Brockmann Rational Modular Matrix',
    shortTag: 'Rationalist Swiss Matrix',
    pioneer: 'Josef Müller-Brockmann',
    year: '1961',
    category: 'Harmonic Modularity',
    whatIsIt:
      'The foundational raster grid system formulated in "Grid Systems in Graphic Design". The poster plane is discretely partitioned into an exact matrix of rows and columns, creating atomic fields that harmonize typographic baselines and visual assets across all 24 coordinates.',
    mechanics:
      'Every column and row coordinate is rigorously evaluated. Modules are placed with uniform or composite proportional dimensions across the full matrix, honoring the exact column and row count set by the designer without artificial caps.',
    designTheory:
      'Eliminates arbitrary positioning through an objective coordinate system. Order and rhythm emerge purely from the mathematical relationship between the module size, gutter spacing, and sheet format.',
    bestFor:
      'Pure Swiss concrete typography, exhibition posters, corporate identity systems, and technical architectures.',
    timeComplexity: 'O(W × H)',
    surfaceCoverage: '100%',
    keyProperties: ['Full Column & Row Reach', 'Rational Proportions', 'Invariant Baselines', 'Concrete Typography'],
  },
};

export interface GridFeatureExplanation {
  title: string;
  subtitle: string;
  whatIsIt: string;
  howItWorks: string;
  designImpact: string;
}

export const GRID_FEATURE_EXPLANATIONS: Record<string, GridFeatureExplanation> = {
  algorithm: {
    title: 'Layout Algorithm Engine',
    subtitle: 'Computational Dissection & Packing Mechanics',
    whatIsIt:
      'The core mathematical engine that partitions 2D space into modular rectangles. Different algorithms embody fundamentally distinct design philosophies: hierarchical tree cuts (BSP), organic natural spirals (Fibonacci), divisible rational proportions (Gerstner), stochastic packing (Gorilla Sun), or tectonic masonry (Staggered Brick).',
    howItWorks:
      'The algorithm accepts the grid dimensions (columns × rows), permitted span matrices, PRNG seed, and constraint parameters, and calculates exact (x, y, width, height) coordinates for every individual module, guaranteeing that blocks align to the coordinate system.',
    designImpact:
      'Swapping the algorithm instantly shifts the poster’s personality from strict Swiss modernism to dynamic brutalist bento packing, neoclassical golden spirals, or De Stijl balance.',
  },
  resolution: {
    title: 'Grid Resolution (Columns × Rows)',
    subtitle: 'The Modular Coordinate Raster',
    whatIsIt:
      'The underlying matrix of discrete coordinate units (e.g. 12×8) that underpins the entire canvas. In graphic design, this is the modular network first formalized by Vitruvius in architecture and later perfected by Josef Müller-Brockmann.',
    howItWorks:
      'Columns define the horizontal subdivisions, and rows define the vertical tiers. Higher numbers (e.g., 16×10) provide finer granularity, allowing subtle proportional differences and intricate micro-modules. Lower numbers (e.g., 6×4) produce bold, monumental, and assertive layouts.',
    designImpact:
      'A 12-column grid is the classic choice because 12 is cleanly divisible by 2, 3, 4, and 6, providing effortless fractional flexibility for headlines and column widths.',
  },
  bspDepth: {
    title: 'Recursive Tree Depth',
    subtitle: 'Hierarchical Subdivision Level (1 to 6)',
    whatIsIt:
      'Controls how many times the recursive Binary Space Partitioning (or Quadtree) algorithm is allowed to split child modules into smaller sub-modules.',
    howItWorks:
      'Depth 1 splits the canvas once into 2 modules. Depth 2 yields up to 4 modules. Depth 3 yields up to 8 modules, and Depth 5 can yield up to 32 modules. Higher depth creates a richer contrast between massive macro-modules and tiny high-frequency detail blocks.',
    designImpact:
      'Low depth (1-2) yields bold architectural monumentality; high depth (4-5) creates dense typographic infographics and multifaceted magazine covers.',
  },
  bspVariance: {
    title: 'Split Variance & Golden Cuts',
    subtitle: 'Bisector Symmetry vs. Organic Ratios',
    whatIsIt:
      'Governs where the partition blade strikes within a node. At 0.0 variance, cuts are rigid 50/50 bisectors. Higher variance shifts cuts towards golden ratio divisions (38.2% / 61.8%) and organic asymmetric proportions.',
    howItWorks:
      'The split position is computed as: split = mid + (prng() - 0.5) × dimension × variance. Constrained to ensure child nodes satisfy minimum span limits.',
    designImpact:
      'Zero variance creates orderly, symmetrical grids; higher variance introduces tension, surprise, and dynamic asymmetrical equilibrium.',
  },
  permittedSpans: {
    title: 'Permitted Spans Matrix',
    subtitle: 'Allowed Geometric Aspect Ratios & Dimensions',
    whatIsIt:
      'The combinatorial alphabet of rectangular shapes that the packing engine is permitted to draw from (e.g. 1×1, 2×1, 1×2, 2×2, 3×2, 4×2).',
    howItWorks:
      'When testing candidate blocks for placement, the engine filters out any shape not included in this allowed list. By checking only 2×1 and 4×2, for instance, you enforce a landscape panoramic aesthetic.',
    designImpact:
      'Constraining allowed shapes maintains visual discipline. Allowing too many disparate aspect ratios creates visual chaos; restricting to a cohesive family ensures typographic harmony.',
  },
  gap: {
    title: 'Gutter Spacing',
    subtitle: 'Negative Space Channels Between Modules',
    whatIsIt:
      'The physical gap in pixels separating adjacent modular boxes. In print typography, this corresponds to the gutter between columns of text.',
    howItWorks:
      'Rendered via CSS Grid `gap` or SVG coordinate offset. A gap of 0px creates seamless brutalist hairline contact where borders merge. Gaps of 12-24px create floating, framed modular containers.',
    designImpact:
      '0px = Raw Constructivist / Brutalist solid surfaces with shared dividing lines. 12-16px = Refined Swiss modernism with clear breathing channels.',
  },
  borderRadius: {
    title: 'Corner Radius',
    subtitle: 'Module Edge Curvature',
    whatIsIt:
      'Controls the sharpness of module corners (0px to 24px).',
    howItWorks:
      'Applies geometric corner rounding to each module container. 0px retains sharp 90-degree industrial right angles.',
    designImpact:
      '0px reinforces brutalism, modernist purity, and architectural discipline. 12-16px introduces contemporary software UI bento aesthetics.',
  },
  focalLocus: {
    title: 'Asymmetric Focal Locus',
    subtitle: 'Anchor Position of Visual Gravity',
    whatIsIt:
      'The spatial coordinate where the dominant "Hero" module or primary ocular entry point is anchored (e.g., Top-Left, Center, Top-Right, Bottom-Left).',
    howItWorks:
      'The algorithm reserves this zone first, positioning a monumental 55-65% module before packing secondary content in the periphery.',
    designImpact:
      'Western reading patterns naturally enter at the Top-Left (F-pattern, Z-pattern). Anchoring at Bottom-Left or Center creates dramatic counter-intuitive visual tension.',
  },
  voidDensity: {
    title: 'Negative Space & Void Ratio (Ma 間)',
    subtitle: 'Intentional Architectural Breathing Voids',
    whatIsIt:
      'The proportion of modular blocks that are intentionally left empty as negative paper space rather than filled with color or borders.',
    howItWorks:
      'The engine flags a calculated percentage of blocks as `isNegativeVoid: true`. These blocks preserve their grid dimensions and spacing but become invisible, allowing the underlying poster canvas to shine through.',
    designImpact:
      'In Japanese aesthetics, *Ma* (間) is the pure space between things that gives form to the whole. In graphic design, white space is not empty space—it is an active design element that commands attention.',
  },
  scanDirection: {
    title: 'Scan Flow & Traversal Direction',
    subtitle: 'Spatial Order of Algorithmic Processing',
    whatIsIt:
      'The coordinate order in which the algorithm inspects vacant cells and places modules.',
    howItWorks:
      'Options include Row-Major (standard left-to-right, top-to-bottom), Column-Major (top-to-bottom vertical columns), Snake (alternating boustrophedon zigzag), and Center-Out (expanding radial waves).',
    designImpact:
      'Row-major creates horizontal band gravity. Column-major produces vertical pillar rhythms. Center-out packs dense structures in the heart while leaving loose margins.',
  },
  gapStrategy: {
    title: 'Residual Gap Strategy',
    subtitle: 'Resolving Unallocated Cell Remnants',
    whatIsIt:
      'In stochastic packing, larger shapes often leave odd 1×1 or 1×2 free cells behind. This strategy determines how those residual fragments are resolved.',
    howItWorks:
      'Consolidate merges adjacent free cells into 2×1 or 1×2 blocks. Fill 1×1 fills each solitary cell with an atomic block. Negative Space leaves them as open breathing room.',
    designImpact:
      'Consolidate creates polished, clean surfaces. Fill 1×1 creates intricate, high-frequency mosaic textures. Negative Space creates airy, fragmented layouts.',
  },
  seed: {
    title: 'PRNG Deterministic Seed',
    subtitle: 'Pseudo-Random Number Reproducibility',
    whatIsIt:
      'An integer value that initializes the deterministic pseudorandom number generator (Mulberry32 PRNG).',
    howItWorks:
      'Every number produces a unique, 100% reproducible sequence of decisions. Entering the exact same seed number on any machine produces the exact same poster composition down to the pixel.',
    designImpact:
      'Allows designers to bookmark, share, and catalog infinite generative variations without losing a layout.',
  },
  symmetryMode: {
    title: 'Symmetry & Structural Reflection',
    subtitle: 'Bilateral Reflection vs Asymmetric Tension',
    whatIsIt:
      'Determines whether the modular grid enforces bilateral horizontal reflection or embraces asymmetric modernist tension.',
    howItWorks:
      'When Bilateral Reflection is active, block placements on the left half of the grid are mirrored across the vertical center axis.',
    designImpact:
      'Classical Renaissance architecture relies on bilateral symmetry for monumental gravitas. Swiss modernism favors asymmetry for dynamic visual movement.',
  },
  aspectConstraint: {
    title: 'Module Aspect Ratio Constraints',
    subtitle: 'Square (1:1) vs Golden Ratio (1:1.618) Proportions',
    whatIsIt:
      'Restricts module dimensions to pure geometric aspect ratios.',
    howItWorks:
      'Square mode forces width = height (1:1 modules). Golden mode optimizes spans towards the golden proportion (w:h ≈ 1.618:1). Free mode allows any integer combination.',
    designImpact:
      'Square constraints produce disciplined, modular grid structures (reminiscent of Wim Crouwel). Golden ratios introduce classical harmonic cadence.',
  },
};

export const WHAT_ARE_GRIDS_MANIFESTO = {
  title: 'What Are Grids in Design?',
  subtitle: 'From Swiss Rationalism to Algorithmic Generative Art',
  lead: 'A grid is not a cage; it is a structural skeleton that makes creative freedom coherent.',
  quote: {
    text: 'The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice.',
    author: 'Josef Müller-Brockmann',
    source: 'Grid Systems in Graphic Design (1981)',
  },
  corePhilosophy:
    'In visual communication and architecture, a grid is an invisible mathematical coordinate system of intersecting vertical, horizontal, and diagonal lines. It divides two-dimensional space into columns, rows, margins, and modules. Rather than placing elements arbitrarily, the designer aligns typography, imagery, and negative space to these structural baselines to achieve clarity, rhythm, and optical balance.',
  whyItMatters:
    'The modern grid emerged from the revolutionary experiments of the Bauhaus (1919), De Stijl (1917), and Russian Constructivism (1920s), reaching its purest expression in the Swiss International Typographic Style of the 1950s and 60s led by Josef Müller-Brockmann, Armin Hofmann, and Karl Gerstner. Gerstner proposed that designing meant "programming": creating a logical system of rules and harmonic proportions that could solve any design problem with objective clarity.',
  anatomy: [
    {
      term: 'Columns & Rows (Raster)',
      definition:
        'Vertical and horizontal spatial divisions that create the foundational cellular matrix of the composition.',
    },
    {
      term: 'Gutters (Interstices)',
      definition:
        'The inactive negative intervals separating columns and rows, providing structural breathing channels for the eye.',
    },
    {
      term: 'Modules (Cells)',
      definition:
        'The individual spatial building blocks formed by the intersection of columns and rows.',
    },
    {
      term: 'Spatial Fields (Multi-Span Zones)',
      definition:
        'Aggregations of adjacent modules combined to form dominant hero areas, portrait windows, or editorial bands.',
    },
    {
      term: 'Flowlines & Hang Lines',
      definition:
        'Horizontal alignment trajectories across the composition that guide the reader’s gaze like sheet music.',
    },
    {
      term: 'Ma (Negative Space / Breathing Room)',
      definition:
        'The deliberate absence of ink or content, honoring Jan Tschichold’s tenet that white space is an active design element.',
    },
  ],
  paragraphs: [
    'In visual communication and architecture, a grid is an invisible mathematical coordinate system of intersecting vertical, horizontal, and diagonal lines. It divides two-dimensional space into columns, rows, margins, and modules. Rather than placing elements arbitrarily, the designer aligns typography, imagery, and negative space to these structural baselines.',
    'The modern grid emerged from the revolutionary experiments of the Bauhaus (1919), De Stijl (1917), and Russian Constructivism (1920s), reaching its purest expression in the Swiss International Typographic Style of the 1950s and 60s led by Josef Müller-Brockmann, Armin Hofmann, and Karl Gerstner. Gerstner proposed that designing meant "programming": creating a logical system of rules and harmonic proportions that could solve any design problem with objective clarity.',
    'In computational and generative design, grids evolve from static paper guidelines into living algorithmic structures. Through algorithms like Recursive Binary Space Partitioning (BSP), Squarified Treemaps, and Stochastic Boolean Packing, the computer acts as an intelligent collaborator—carving, weighting, and balancing space in fractions of a millisecond while preserving the timeless principles of scale, rhythm, and proportion.',
  ],
};
