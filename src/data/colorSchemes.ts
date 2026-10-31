/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorScheme {
  id: string;
  name: string;
  category: 'retro-os' | 'brutalism';
  colors: string[];
  description: string;
  hardwareEra?: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'vga-95',
    name: 'Windows 95 16-Color VGA',
    category: 'retro-os',
    hardwareEra: '1995 • Microsoft Windows',
    description: 'Classic Microsoft Windows 95 standard 16-color VGA palette',
    colors: [
      '#008080', // Teal Desktop
      '#000080', // Navy Titlebar
      '#C0C0C0', // Silver 3D Face
      '#800000', // Maroon
      '#808000', // Olive
      '#800080', // Purple
      '#008000', // Green
      '#0000FF', // Bright Blue
      '#00FFFF', // Cyan
      '#FF00FF', // Magenta
      '#FFFF00', // Yellow
      '#FFFFFF', // White
      '#808080', // Dark Gray
      '#000000', // Black
    ],
  },
  {
    id: 'win95-high-contrast',
    name: 'Windows 95 High Contrast Brutalism',
    category: 'brutalism',
    hardwareEra: '1995 • Win95 Scheme #1',
    description: 'Stark black, neon lime, cyan, and yellow digital brutalism',
    colors: [
      '#000000', // Pitch Black
      '#FFFFFF', // Stark White
      '#00FF00', // Electric Lime
      '#00FFFF', // Pure Cyan
      '#FF00FF', // Hot Magenta
      '#FFFF00', // Acid Yellow
      '#000080', // Deep Navy
    ],
  },
  {
    id: 'win31-hotdog',
    name: 'Windows 3.1 Hotdog Stand (1992)',
    category: 'retro-os',
    hardwareEra: '1992 • Windows 3.1',
    description: 'The legendary red, yellow, and black high-voltage brutalist classic',
    colors: [
      '#FF0000', // Ketchup Red
      '#FFFF00', // Mustard Yellow
      '#000000', // Stark Black
      '#FFFFFF', // Pure White
    ],
  },
  {
    id: 'win98-desktop',
    name: 'Windows 98 / 2000 Teal & Navy',
    category: 'retro-os',
    hardwareEra: '1998 • Windows 98 SE',
    description: 'Authentic Microsoft Windows 98 desktop, active titlebar gradient, and chrome',
    colors: [
      '#008080', // Desktop Teal
      '#000080', // Active Title Navy
      '#1084D0', // Active Gradient Cyan
      '#C0C0C0', // Silver Button Face
      '#808080', // Inactive Caption
      '#000000', // Window Text
      '#FFFFFF', // Window Background
      '#FFFFE1', // Tooltip Yellow
    ],
  },
  {
    id: 'norton-commander',
    name: 'MS-DOS Norton Commander (1986)',
    category: 'retro-os',
    hardwareEra: '1986 • Peter Norton DOS',
    description: 'Iconic two-panel blue, cyan, and white ASCII file manager brutalism',
    colors: [
      '#0000A8', // Commander Blue
      '#00A8A8', // Panel Cyan
      '#FFFFFF', // Active White
      '#A8A8A8', // Frame Gray
      '#FFFF55', // Function Key Yellow
      '#000000', // Console Black
      '#A80000', // Alert Crimson
    ],
  },
  {
    id: 'cga-mode1',
    name: 'IBM PC CGA Mode 1 (Cyan/Magenta)',
    category: 'retro-os',
    hardwareEra: '1981 • IBM PC 5150',
    description: 'Hardware 4-color CGA Mode 1: Black, Cyan, Magenta, White',
    colors: [
      '#000000', // Background Black
      '#55FFFF', // Light Cyan
      '#FF55FF', // Light Magenta
      '#FFFFFF', // High White
      '#00AAAA', // Standard Cyan
      '#AA00AA', // Standard Magenta
    ],
  },
  {
    id: 'cga-mode0',
    name: 'IBM PC CGA Mode 0 (Green/Red/Yellow)',
    category: 'retro-os',
    hardwareEra: '1981 • IBM PC 5150',
    description: 'Hardware 4-color CGA Mode 0: Black, Green, Red, and Brown/Yellow',
    colors: [
      '#000000', // Background Black
      '#55FF55', // Light Green
      '#FF5555', // Light Red
      '#FFFF55', // Light Yellow
      '#00AA00', // Standard Green
      '#AA0000', // Standard Red
      '#AA5500', // Standard Brown
    ],
  },
  {
    id: 'c64-vicii',
    name: 'Commodore 64 VIC-II 16-Color',
    category: 'retro-os',
    hardwareEra: '1982 • Commodore C64',
    description: 'The authentic 16 fixed colors of the MOS Technology VIC-II chip',
    colors: [
      '#000000', // Black
      '#FFFFFF', // White
      '#880000', // Red
      '#AAFFEE', // Cyan
      '#CC44CC', // Purple
      '#00CC55', // Green
      '#0000AA', // Blue
      '#EEEE77', // Yellow
      '#DD8855', // Orange
      '#664400', // Brown
      '#FF7777', // Light Red
      '#333333', // Dark Gray
      '#777777', // Medium Gray
      '#AAFF66', // Light Green
      '#0088FF', // Light Blue
      '#BBBBBB', // Light Gray
    ],
  },
  {
    id: 'apple-sys7',
    name: 'Apple Macintosh System 7 (1991)',
    category: 'retro-os',
    hardwareEra: '1991 • Apple QuickDraw',
    description: 'System 7 platinum bevels, dark charcoal accents, and QuickDraw lilac',
    colors: [
      '#000000', // 1-bit Black
      '#FFFFFF', // Clean White
      '#D8D8D8', // Platinum Bevel
      '#808080', // Charcoal Gray
      '#404040', // Deep Slate
      '#1B365D', // Macintosh Navy
      '#9E7B9B', // System 7 Lilac
      '#B33939', // Apple Ruby
    ],
  },
  {
    id: 'teletext-ceefax',
    name: 'Teletext & Ceefax 3-Bit Broadcast',
    category: 'brutalism',
    hardwareEra: '1976 • BBC Ceefax',
    description: 'Pure 3-bit RGB broadcast transmission graphics: Red, Green, Yellow, Blue, Magenta, Cyan',
    colors: [
      '#000000', // Pitch Black
      '#FF0000', // Pure Red
      '#00FF00', // Pure Green
      '#FFFF00', // Pure Yellow
      '#0000FF', // Pure Blue
      '#FF00FF', // Pure Magenta
      '#00FFFF', // Pure Cyan
      '#FFFFFF', // Pure White
    ],
  },
  {
    id: 'crt-phosphor-p1',
    name: 'IBM 5151 Green CRT Phosphor P1',
    category: 'retro-os',
    hardwareEra: '1981 • Monochrome Display',
    description: 'IBM 5151 monochrome cathode-ray phosphor glow from deep void to searing neon lime',
    colors: [
      '#001100', // Deep Void
      '#002B00', // Low Phosphor
      '#004F00', // Mid Phosphor
      '#008000', // Pure Terminal Green
      '#00B300', // Active Scanline
      '#00FF00', // Intense Glow
      '#66FF66', // Saturated Beam
      '#B3FFB3', // Beam Focus Highlight
    ],
  },
  {
    id: 'crt-amber-p4',
    name: 'DEC VT220 Amber Monochrome CRT',
    category: 'retro-os',
    hardwareEra: '1983 • DEC Terminal',
    description: 'DEC VT220 / Wyse 60 warm amber phosphor CRT display graduation',
    colors: [
      '#140800', // Void Brown
      '#331400', // Dark Amber
      '#5C2600', // Shadow Amber
      '#8A3B00', // Terminal Core
      '#BD5300', // Bright Amber
      '#FF7700', // Pure Phosphor
      '#FFA133', // Beam Glow
      '#FFCB73', // Core Hotspot
    ],
  },
  {
    id: 'web1-brutalist',
    name: 'Raw Web 1.0 HTML Brutalism',
    category: 'brutalism',
    hardwareEra: '1994 • Mosaic / Netscape',
    description: 'Unstyled Web 1.0 hypermedia: #0000EE link blue, #551A8B visited purple, and #C0C0C0 body',
    colors: [
      '#0000EE', // Default Hyperlink Blue
      '#551A8B', // Visited Link Purple
      '#FF0000', // Active Link Red
      '#C0C0C0', // Default Browser Body Gray
      '#000000', // Plain Text Black
      '#FFFFFF', // Table Cell White
      '#008000', // HTML Comment Green
      '#FFFF00', // Marquee Warning
    ],
  },
  {
    id: 'brutalist-raw',
    name: 'Pure Digital Brutalism (Stark Contrast)',
    category: 'brutalism',
    hardwareEra: 'Raw Digital Brutalism',
    description: 'Uncompromising high-contrast raw signal colors and stark black/white geometries',
    colors: [
      '#000000', // Pitch Black
      '#FFFF00', // Hazard Yellow
      '#FF3300', // Safety Orange
      '#0000FF', // High-Voltage Blue
      '#00FF66', // Toxic Green
      '#FFFFFF', // Raw Paper White
      '#FF0055', // Radical Magenta
    ],
  },
  {
    id: 'nextstep-black',
    name: 'NeXTSTEP 3.0 Slate & Black',
    category: 'retro-os',
    hardwareEra: '1989 • NeXT Computer',
    description: 'Architectural precision: deep slate, titanium grays, and NeXT dark blue',
    colors: [
      '#000000', // NeXT Black
      '#1A1A1A', // Carbon
      '#333333', // Graphite
      '#555555', // Dark Slate
      '#777777', // Titanium Mid
      '#AAAAAA', // Silver Face
      '#D4D4D4', // Chiseled Bevel
      '#FFFFFF', // Crisp White
      '#2B4C7E', // NeXT Dark Blue
    ],
  },
  {
    id: 'gameboy-dmg',
    name: 'Game Boy DMG-01 4-Shade Monochromatic',
    category: 'retro-os',
    hardwareEra: '1989 • Nintendo DMG',
    description: 'Original 1989 Nintendo Game Boy reflective STN LCD pea-soup palette',
    colors: [
      '#0F380F', // Darkest Olive Black
      '#306230', // Dark Olive Green
      '#8BAC0F', // Light Olive Green
      '#9BBC0F', // Brightest Pea Soup Yellow-Green
    ],
  },
  {
    id: 'coco-retro',
    name: 'Tandy / TRS-80 Color Computer (1980)',
    category: 'retro-os',
    hardwareEra: '1980 • Motorola VDG',
    description: 'Motorola 6847 video display generator 8 primary saturated hues',
    colors: [
      '#000000',
      '#00FF00',
      '#FFFF00',
      '#0000FF',
      '#FF0000',
      '#FFFFFF',
      '#00FFFF',
      '#FF00FF',
      '#FF8000',
    ],
  },
];

export const DEFAULT_COLOR_SCHEME_ID = 'vga-95';

export function getColorScheme(id: string): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.id === id) || COLOR_SCHEMES[0];
}
