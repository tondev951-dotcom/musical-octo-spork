import { SymbolId } from '../../core/types';

/**
 * Every symbol is an inline SVG rendered to a texture at preload — the game
 * ships zero external art. Gold-on-dark Egyptian iconography on a sandstone
 * tile, Book-of-Ra style.
 */

const GOLD = '#e8b93b';
const GOLD_DARK = '#a97c16';
const GOLD_LIGHT = '#ffe9a8';
const LAPIS = '#1b2a5e';
const TEAL = '#1e8f86';
const RED = '#a63a28';

function tile(inner: string, border = GOLD): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c2013"/>
      <stop offset="0.5" stop-color="#1c140b"/>
      <stop offset="1" stop-color="#241a0e"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD_LIGHT}"/>
      <stop offset="0.45" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="${GOLD_DARK}"/>
    </linearGradient>
  </defs>
  <rect x="5" y="5" width="190" height="190" rx="16" fill="url(#card)" stroke="${border}" stroke-width="4"/>
  <rect x="12" y="12" width="176" height="176" rx="11" fill="none" stroke="${border}" stroke-opacity="0.35" stroke-width="1.5"/>
  ${inner}
</svg>`;
}

/** Ornate royal letter with a small hieroglyph accent. */
function royal(letter: string, accent: string): string {
  return tile(
    `<text x="100" y="128" font-family="Georgia, 'Times New Roman', serif" font-size="110" font-weight="bold"
       text-anchor="middle" fill="url(#gold)" stroke="${GOLD_DARK}" stroke-width="2.5">${letter}</text>
     ${accent}`,
    GOLD_DARK,
  );
}

const BOOK_SVG = tile(
  `<g>
    <rect x="38" y="52" width="124" height="100" rx="8" fill="${GOLD_DARK}"/>
    <rect x="44" y="46" width="112" height="100" rx="6" fill="url(#gold)"/>
    <rect x="56" y="58" width="88" height="76" rx="4" fill="${LAPIS}"/>
    <path d="M70 96 Q100 74 130 96 Q100 118 70 96 Z" fill="url(#gold)"/>
    <circle cx="100" cy="96" r="9" fill="${LAPIS}"/>
    <circle cx="100" cy="96" r="4" fill="${GOLD_LIGHT}"/>
    <path d="M100 156 l-8 14 h16 Z" fill="url(#gold)"/>
    <rect x="92" y="146" width="16" height="8" fill="${GOLD_DARK}"/>
    <path d="M60 30 l6 10 h-12 Z M140 30 l6 10 h-12 Z" fill="${GOLD}"/>
  </g>`,
  GOLD_LIGHT,
);

const PHARAOH_SVG = tile(
  `<g>
    <path d="M58 58 Q58 30 100 30 Q142 30 142 58 L142 118 Q142 132 130 140 L120 148 H80 L70 140 Q58 132 58 118 Z" fill="url(#gold)"/>
    <path d="M58 62 h84 v12 h-84 Z M58 86 h84 v12 h-84 Z" fill="${LAPIS}"/>
    <path d="M74 110 Q100 100 126 110 L126 128 Q113 122 100 122 Q87 122 74 128 Z" fill="#d99c22"/>
    <ellipse cx="87" cy="112" rx="7" ry="4.5" fill="${LAPIS}"/>
    <ellipse cx="113" cy="112" rx="7" ry="4.5" fill="${LAPIS}"/>
    <path d="M96 118 h8 l-4 12 Z" fill="${GOLD_DARK}"/>
    <rect x="92" y="146" width="16" height="26" rx="4" fill="url(#gold)"/>
    <path d="M92 154 h16 M92 162 h16" stroke="${LAPIS}" stroke-width="3"/>
    <path d="M100 22 q10 4 0 16 q-10 -12 0 -16" fill="${TEAL}"/>
  </g>`,
);

const HORUS_SVG = tile(
  `<g>
    <path d="M34 96 Q70 62 108 62 Q146 62 166 88 Q150 76 128 76 Q160 84 166 104 Q146 92 120 92 Q90 92 66 104 Q48 104 34 96 Z" fill="url(#gold)"/>
    <circle cx="100" cy="86" r="15" fill="${LAPIS}"/>
    <circle cx="100" cy="86" r="7" fill="${GOLD_LIGHT}"/>
    <path d="M40 100 Q68 116 100 112" stroke="url(#gold)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M104 108 L96 150 Q94 160 86 162" stroke="url(#gold)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M126 100 Q134 128 122 152" stroke="url(#gold)" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="122" cy="158" r="7" fill="${TEAL}"/>
  </g>`,
);

const SCARAB_SVG = tile(
  `<g>
    <circle cx="100" cy="52" r="14" fill="${RED}" stroke="url(#gold)" stroke-width="3"/>
    <path d="M64 60 Q46 48 40 32 M136 60 Q154 48 160 32" stroke="url(#gold)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="94" rx="26" ry="20" fill="url(#gold)"/>
    <ellipse cx="100" cy="132" rx="36" ry="30" fill="url(#gold)"/>
    <path d="M100 104 v56 M80 112 L64 100 M120 112 L136 100 M78 134 L58 132 M122 134 L142 132 M84 152 L70 166 M116 152 L130 166" stroke="${GOLD_DARK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M100 104 v56" stroke="#2c2013" stroke-width="3"/>
    <ellipse cx="90" cy="90" rx="5" ry="7" fill="${LAPIS}"/>
    <ellipse cx="110" cy="90" rx="5" ry="7" fill="${LAPIS}"/>
  </g>`,
);

const ANKH_SVG = tile(
  `<g>
    <path d="M100 34 Q76 34 76 58 Q76 78 100 92 Q124 78 124 58 Q124 34 100 34 Z M100 48 Q112 48 112 59 Q112 70 100 78 Q88 70 88 59 Q88 48 100 48 Z" fill="url(#gold)" fill-rule="evenodd"/>
    <rect x="92" y="88" width="16" height="80" rx="6" fill="url(#gold)"/>
    <rect x="58" y="96" width="84" height="16" rx="6" fill="url(#gold)"/>
    <circle cx="100" cy="104" r="7" fill="${TEAL}"/>
  </g>`,
);

const PYRAMID_SVG = tile(
  `<g>
    <circle cx="146" cy="52" r="18" fill="${GOLD_LIGHT}"/>
    <circle cx="146" cy="52" r="24" fill="${GOLD_LIGHT}" opacity="0.35"/>
    <path d="M100 54 L168 158 H32 Z" fill="url(#gold)"/>
    <path d="M100 54 L124 90 L88 158 H32 Z" fill="#c8931f"/>
    <path d="M100 54 L124 90 L110 112 Z" fill="${GOLD_LIGHT}" opacity="0.5"/>
    <path d="M32 158 h136" stroke="${GOLD_DARK}" stroke-width="6" stroke-linecap="round"/>
  </g>`,
);

export const SYMBOL_SVGS: Record<SymbolId, string> = {
  [SymbolId.BOOK]: BOOK_SVG,
  [SymbolId.PHARAOH]: PHARAOH_SVG,
  [SymbolId.HORUS]: HORUS_SVG,
  [SymbolId.SCARAB]: SCARAB_SVG,
  [SymbolId.ANKH]: ANKH_SVG,
  [SymbolId.PYRAMID]: PYRAMID_SVG,
  [SymbolId.A]: royal('A', `<path d="M84 156 h32 M78 166 h44" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/>`),
  [SymbolId.K]: royal('K', `<path d="M84 156 h32 M78 166 h44" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>`),
  [SymbolId.Q]: royal('Q', `<circle cx="100" cy="161" r="6" fill="${TEAL}" />`),
  [SymbolId.J]: royal('J', `<circle cx="100" cy="161" r="6" fill="${RED}" />`),
  [SymbolId.TEN]: royal('10', `<path d="M86 158 l14 10 14 -10" stroke="${TEAL}" stroke-width="4" fill="none" stroke-linecap="round"/>`),
};

export function symbolTextureKey(s: SymbolId): string {
  return `sym-${s}`;
}
