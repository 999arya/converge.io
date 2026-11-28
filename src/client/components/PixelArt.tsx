/**
 * Inline pixel-art scenery and animated sprites.
 * Everything is drawn with SVG rectangles and crisp edges so the
 * game keeps its crunchy arcade Minecraft look without downloading external image assets.
 */

/* =========================================================
   TYPE ALIASES
   ========================================================= */

export type PixelForestProps = {
  className?: string | undefined;
  dark?: boolean | undefined;
};

export type TreeColors = {
  outline: string;
  light: string;
  mid: string;
  dark: string;
  shadow: string;
  trunk: string;
  trunkLight: string;
};

export type TreePlacement = {
  x: number;
  y: number;
  scale?: number | undefined;
};

export type PixelBirdVariant = 'seagull' | 'parrot' | 'bluebird';

export type BirdColors = {
  outline: string;
  body: string;
  bodyHighlight: string;
  wing: string;
  wingHighlight: string;
  wingTip: string;
  beak: string;
  eye: string;
};

export type PixelBirdProps = {
  className?: string | undefined;
  variant?: PixelBirdVariant | undefined;
  flip?: boolean | undefined;
};

export type PixelPalmTreeProps = {
  className?: string | undefined;
  flip?: boolean | undefined;
};

export type PixelGameBackgroundProps = {
  className?: string | undefined;
};

export type PixelPalmBannerProps = {
  className?: string | undefined;
  dark?: boolean | undefined;
};

export type PixelCloudProps = {
  className?: string | undefined;
  dark?: boolean | undefined;
};

/* =========================================================
   COLOR PALETTES
   ========================================================= */

const CANOPY_ROWS = [
  { y: 1, x: 11, width: 2, tone: 'light' },
  { y: 3, x: 10, width: 4, tone: 'light' },
  { y: 5, x: 9, width: 6, tone: 'mid' },
  { y: 7, x: 8, width: 8, tone: 'mid' },
  { y: 9, x: 7, width: 10, tone: 'dark' },
  { y: 11, x: 6, width: 12, tone: 'dark' },
  { y: 13, x: 5, width: 14, tone: 'shadow' },
  { y: 15, x: 6, width: 12, tone: 'shadow' },
] as const;

const TREE_PLACEMENTS: TreePlacement[] = [
  { x: 4, y: 4 },
  { x: 30, y: 8, scale: 0.85 },
  { x: 58, y: 2 },
  { x: 92, y: 10, scale: 0.8 },
  { x: 120, y: 4 },
  { x: 145, y: 11, scale: 0.75 },
];

const LIGHT_COLORS: TreeColors = {
  outline: '#090d16',
  light: '#4ade80',
  mid: '#22c55e',
  dark: '#16a34a',
  shadow: '#15803d',
  trunk: '#92400e',
  trunkLight: '#b45309',
};

const DARK_COLORS: TreeColors = {
  outline: '#020617',
  light: '#047857',
  mid: '#065f46',
  dark: '#064e3b',
  shadow: '#022c22',
  trunk: '#451a03',
  trunkLight: '#78350f',
};

type CloudTone = 'highlight' | 'top' | 'mid' | 'shadow';

type CloudColors = Record<CloudTone | 'outline', string>;

type CloudSegment = { x: number; width: number };
type CloudRow = { y: number; segments: CloudSegment[]; tone: CloudTone };

/**
 * Puffy cloud silhouette on a 64x28 grid. Two small top lobes merge into a
 * wide base, which reads as a cloud instead of a flat pyramid.
 */
const CLOUD_ROWS: CloudRow[] = [
  { y: 4, segments: [{ x: 26, width: 8 }, { x: 42, width: 8 }], tone: 'highlight' },
  { y: 6, segments: [{ x: 22, width: 14 }, { x: 38, width: 14 }], tone: 'highlight' },
  { y: 8, segments: [{ x: 18, width: 30 }], tone: 'top' },
  { y: 10, segments: [{ x: 14, width: 36 }], tone: 'top' },
  { y: 12, segments: [{ x: 10, width: 44 }], tone: 'top' },
  { y: 14, segments: [{ x: 6, width: 52 }], tone: 'mid' },
  { y: 16, segments: [{ x: 4, width: 56 }], tone: 'mid' },
  { y: 18, segments: [{ x: 4, width: 56 }], tone: 'shadow' },
  { y: 20, segments: [{ x: 8, width: 48 }], tone: 'shadow' },
  { y: 22, segments: [{ x: 14, width: 36 }], tone: 'shadow' },
];

const LIGHT_CLOUD_COLORS: CloudColors = {
  outline: '#475569',
  highlight: '#ffffff',
  top: '#f8fafc',
  mid: '#e2e8f0',
  shadow: '#cbd5e1',
};

const DARK_CLOUD_COLORS: CloudColors = {
  outline: '#020617',
  highlight: '#64748b',
  top: '#475569',
  mid: '#334155',
  shadow: '#1e293b',
};

const BIRD_PALETTES: Record<PixelBirdVariant, BirdColors> = {
  seagull: {
    outline: '#090d16',
    body: '#ffffff',
    bodyHighlight: '#f1f5f9',
    wing: '#94a3b8',
    wingHighlight: '#e2e8f0',
    wingTip: '#334155',
    beak: '#f59e0b',
    eye: '#090d16',
  },
  parrot: {
    outline: '#090d16',
    body: '#ef4444',
    bodyHighlight: '#f87171',
    wing: '#2563eb',
    wingHighlight: '#fbbf24',
    wingTip: '#1e3a8a',
    beak: '#fef08a',
    eye: '#090d16',
  },
  bluebird: {
    outline: '#090d16',
    body: '#0284c7',
    bodyHighlight: '#38bdf8',
    wing: '#06b6d4',
    wingHighlight: '#a5f3fc',
    wingTip: '#0e7490',
    beak: '#fbbf24',
    eye: '#090d16',
  },
};

/* =========================================================
   HIGH-DETAIL PIXEL CLOUD SPRITE
   ========================================================= */

type PixelCloudGlyphProps = {
  x: number;
  y: number;
  scale?: number | undefined;
  dark?: boolean | undefined;
};

/** Raw SVG cloud glyph so it can be placed inside any scenery viewBox. */
const PixelCloudGlyph = ({ x, y, scale = 1, dark = false }: PixelCloudGlyphProps) => {
  const colors = dark ? DARK_CLOUD_COLORS : LIGHT_CLOUD_COLORS;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* One-pixel outline follows each puffy lobe of the silhouette. */}
      {CLOUD_ROWS.flatMap((row) =>
        row.segments.map((segment) => (
          <rect
            key={`outline-${row.y}-${segment.x}`}
            x={segment.x - 1}
            y={row.y - 1}
            width={segment.width + 2}
            height="4"
            fill={colors.outline}
          />
        ))
      )}
      {/* Layered fills give the cloud volume and a bright top rim. */}
      {CLOUD_ROWS.flatMap((row) =>
        row.segments.map((segment) => (
          <rect
            key={`fill-${row.y}-${segment.x}`}
            x={segment.x}
            y={row.y}
            width={segment.width}
            height="2"
            fill={colors[row.tone]}
          />
        ))
      )}
      {/* Pixel glints on the top lobes and soft shading along the base. */}
      <rect x="28" y="6" width="6" height="2" fill={colors.highlight} />
      <rect x="44" y="6" width="6" height="2" fill={colors.highlight} />
      <rect x="20" y="10" width="8" height="2" fill={colors.highlight} />
      <rect x="10" y="18" width="12" height="2" fill={colors.shadow} />
      <rect x="38" y="20" width="12" height="2" fill={colors.shadow} />
    </g>
  );
};

/** Standalone drifting cloud used as a full-page background sprite. */
export const PixelCloud = ({ className, dark = false }: PixelCloudProps) => (
  <div className={`pixel-art pointer-events-none select-none inline-block ${className ?? ''}`}>
    <svg
      viewBox="0 0 64 28"
      shapeRendering="crispEdges"
      className="h-full w-full overflow-visible"
    >
      <PixelCloudGlyph x={0} y={0} dark={dark} />
    </svg>
  </div>
);

/* =========================================================
   FOREST TREE SPRITE (ORIGINAL COMPATIBILITY)
   ========================================================= */

const PixelTreeShape = ({
  placement,
  colors,
}: {
  placement: TreePlacement;
  colors: TreeColors;
}) => {
  const scale = placement.scale ?? 1;

  return (
    <g transform={`translate(${placement.x} ${placement.y}) scale(${scale})`}>
      <rect x="10" y="17" width="4" height="13" fill={colors.outline} />
      <rect x="11" y="18" width="2" height="11" fill={colors.trunk} />
      <rect x="11" y="18" width="1" height="11" fill={colors.trunkLight} />
      {CANOPY_ROWS.map((row) => (
        <g key={row.y}>
          <rect
            x={row.x - 1}
            y={row.y - 1}
            width={row.width + 2}
            height="3"
            fill={colors.outline}
          />
          <rect
            x={row.x}
            y={row.y}
            width={row.width}
            height="2"
            fill={colors[row.tone]}
          />
        </g>
      ))}
    </g>
  );
};

export const PixelForest = ({ className, dark = false }: PixelForestProps) => {
  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  const sky = dark ? '#071426' : '#dbeafe';
  const ground = dark ? '#0f3d2e' : '#86efac';
  const grass = dark ? '#064e3b' : '#22c55e';
  const flower = dark ? '#fcd34d' : '#fbbf24';

  return (
    <div
      aria-hidden="true"
      className={`pixel-art pointer-events-none overflow-hidden ${className ?? ''}`}
      style={{ backgroundColor: sky }}
    >
      <svg
        viewBox="0 0 160 40"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
        className="h-full w-full"
      >
        <rect x="0" y="0" width="160" height="40" fill={sky} />
        <PixelCloudGlyph x={8} y={2} scale={0.62} dark={dark} />
        <PixelCloudGlyph x={94} y={4} scale={0.52} dark={dark} />
        {TREE_PLACEMENTS.map((placement) => (
          <PixelTreeShape
            key={`${placement.x}-${placement.y}`}
            placement={placement}
            colors={colors}
          />
        ))}
        <rect x="0" y="34" width="160" height="6" fill={ground} />
        <rect x="0" y="37" width="160" height="3" fill={grass} />
        <g fill={flower}>
          <rect x="26" y="32" width="2" height="2" />
          <rect x="84" y="33" width="2" height="2" />
          <rect x="138" y="32" width="2" height="2" />
        </g>
      </svg>
    </div>
  );
};

/* =========================================================
   PIXEL BIRD COMPONENT (MINECRAFT FLAPPING ANIMATION)
   ========================================================= */

export const PixelBird = ({
  className,
  variant = 'seagull',
  flip = false,
}: PixelBirdProps) => {
  const colors = BIRD_PALETTES[variant];

  return (
    <div className={`pixel-art pointer-events-none select-none inline-block ${className ?? ''}`}>
      <svg
        viewBox="0 0 24 18"
        shapeRendering="crispEdges"
        className="h-full w-full overflow-visible"
      >
        <g transform={flip ? 'translate(24, 0) scale(-1, 1)' : undefined}>
          {/* Main Body & Head Silhouette Outlines */}
          <rect x="13" y="3" width="7" height="7" fill={colors.outline} />
          <rect x="6" y="5" width="10" height="7" fill={colors.outline} />
          <rect x="2" y="6" width="6" height="4" fill={colors.outline} />
          <rect x="19" y="5" width="4" height="4" fill={colors.outline} />

          {/* Body & Head Fills */}
          <rect x="14" y="4" width="5" height="5" fill={colors.body} />
          <rect x="15" y="4" width="3" height="2" fill={colors.bodyHighlight} />
          <rect x="7" y="6" width="8" height="5" fill={colors.body} />
          <rect x="8" y="6" width="6" height="2" fill={colors.bodyHighlight} />

          {/* Tail Feathers */}
          <rect x="3" y="7" width="4" height="2" fill={colors.wingTip} />
          <rect x="1" y="8" width="3" height="2" fill={colors.wingTip} />

          {/* Eye with glint */}
          <rect x="16" y="5" width="2" height="2" fill={colors.eye} />
          <rect x="16" y="5" width="1" height="1" fill="#ffffff" />

          {/* Beak */}
          <rect x="20" y="6" width="3" height="2" fill={colors.beak} />

          {/* Frame 1: Wing Flap UP */}
          <g className="pixel-bird-wing-up">
            <rect x="7" y="1" width="7" height="6" fill={colors.outline} />
            <rect x="6" y="0" width="5" height="4" fill={colors.outline} />
            <rect x="8" y="2" width="5" height="4" fill={colors.wing} />
            <rect x="9" y="2" width="3" height="2" fill={colors.wingHighlight} />
            <rect x="7" y="1" width="3" height="2" fill={colors.wingTip} />
          </g>

          {/* Frame 2: Wing Flap DOWN */}
          <g className="pixel-bird-wing-down">
            <rect x="7" y="8" width="7" height="6" fill={colors.outline} />
            <rect x="6" y="11" width="5" height="4" fill={colors.outline} />
            <rect x="8" y="9" width="5" height="4" fill={colors.wing} />
            <rect x="9" y="10" width="3" height="2" fill={colors.wingHighlight} />
            <rect x="7" y="13" width="3" height="2" fill={colors.wingTip} />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* =========================================================
   PIXEL PALM TREE COMPONENT (MINECRAFT BOXY AESTHETIC)
   ========================================================= */

export const PixelPalmTree = ({
  className,
  flip = false,
}: PixelPalmTreeProps) => {
  return (
    <div className={`pixel-art pointer-events-none select-none inline-block ${className ?? ''}`}>
      <svg
        viewBox="0 0 80 96"
        shapeRendering="crispEdges"
        className="h-full w-full overflow-visible"
      >
        <g transform={flip ? 'translate(80, 0) scale(-1, 1)' : undefined}>
          {/* Base Sand Mound */}
          <rect x="24" y="88" width="30" height="6" fill="#090d16" />
          <rect x="25" y="89" width="28" height="4" fill="#fbbf24" />
          <rect x="27" y="89" width="14" height="2" fill="#fef08a" />
          <rect x="28" y="91" width="20" height="2" fill="#d97706" />

          {/* Segment 1 (Base Trunk) */}
          <rect x="35" y="80" width="11" height="9" fill="#090d16" />
          <rect x="36" y="81" width="9" height="7" fill="#78350f" />
          <rect x="37" y="81" width="3" height="6" fill="#b45309" />
          <rect x="42" y="82" width="2" height="6" fill="#451a03" />

          {/* Segment 2 */}
          <rect x="34" y="71" width="11" height="10" fill="#090d16" />
          <rect x="35" y="72" width="9" height="8" fill="#78350f" />
          <rect x="36" y="72" width="3" height="7" fill="#b45309" />
          <rect x="41" y="73" width="2" height="7" fill="#451a03" />

          {/* Segment 3 (Curving left) */}
          <rect x="33" y="61" width="11" height="11" fill="#090d16" />
          <rect x="34" y="62" width="9" height="9" fill="#78350f" />
          <rect x="35" y="62" width="3" height="8" fill="#b45309" />
          <rect x="40" y="63" width="2" height="8" fill="#451a03" />

          {/* Segment 4 */}
          <rect x="32" y="51" width="11" height="11" fill="#090d16" />
          <rect x="33" y="52" width="9" height="9" fill="#78350f" />
          <rect x="34" y="52" width="3" height="8" fill="#b45309" />
          <rect x="39" y="53" width="2" height="8" fill="#451a03" />

          {/* Segment 5 */}
          <rect x="32" y="41" width="11" height="11" fill="#090d16" />
          <rect x="33" y="42" width="9" height="9" fill="#78350f" />
          <rect x="34" y="42" width="3" height="8" fill="#b45309" />
          <rect x="39" y="43" width="2" height="8" fill="#451a03" />

          {/* Segment 6 (Crown stem) */}
          <rect x="33" y="32" width="10" height="10" fill="#090d16" />
          <rect x="34" y="33" width="8" height="8" fill="#78350f" />
          <rect x="35" y="33" width="3" height="7" fill="#b45309" />

          {/* Coconuts nestled in crown */}
          <g>
            <rect x="29" y="35" width="7" height="7" fill="#090d16" />
            <rect x="30" y="36" width="5" height="5" fill="#582900" />
            <rect x="31" y="36" width="2" height="2" fill="#92400e" />

            <rect x="38" y="35" width="7" height="7" fill="#090d16" />
            <rect x="39" y="36" width="5" height="5" fill="#582900" />
            <rect x="40" y="36" width="2" height="2" fill="#92400e" />

            <rect x="34" y="40" width="7" height="7" fill="#090d16" />
            <rect x="35" y="41" width="5" height="5" fill="#451a03" />
            <rect x="36" y="41" width="2" height="2" fill="#78350f" />
          </g>

          {/* Palm Fronds / Leaves */}
          <g>
            {/* Top Center Fronds */}
            <rect x="34" y="2" width="8" height="6" fill="#090d16" />
            <rect x="35" y="3" width="6" height="4" fill="#86efac" />
            <rect x="33" y="7" width="10" height="8" fill="#090d16" />
            <rect x="34" y="8" width="8" height="6" fill="#4ade80" />
            <rect x="32" y="14" width="12" height="8" fill="#090d16" />
            <rect x="33" y="15" width="10" height="6" fill="#22c55e" />
            <rect x="32" y="21" width="12" height="8" fill="#090d16" />
            <rect x="33" y="22" width="10" height="6" fill="#16a34a" />

            {/* Top-Left Arching Frond */}
            <rect x="24" y="10" width="10" height="8" fill="#090d16" />
            <rect x="25" y="11" width="8" height="6" fill="#4ade80" />
            <rect x="17" y="13" width="9" height="7" fill="#090d16" />
            <rect x="18" y="14" width="7" height="5" fill="#22c55e" />
            <rect x="10" y="17" width="9" height="7" fill="#090d16" />
            <rect x="11" y="18" width="7" height="5" fill="#4ade80" />
            <rect x="5" y="22" width="7" height="7" fill="#090d16" />
            <rect x="6" y="23" width="5" height="5" fill="#22c55e" />
            <rect x="2" y="28" width="5" height="7" fill="#090d16" />
            <rect x="3" y="29" width="3" height="5" fill="#16a34a" />

            {/* Top-Right Arching Frond */}
            <rect x="42" y="10" width="10" height="8" fill="#090d16" />
            <rect x="43" y="11" width="8" height="6" fill="#4ade80" />
            <rect x="50" y="13" width="9" height="7" fill="#090d16" />
            <rect x="51" y="14" width="7" height="5" fill="#22c55e" />
            <rect x="57" y="17" width="9" height="7" fill="#090d16" />
            <rect x="58" y="18" width="7" height="5" fill="#4ade80" />
            <rect x="64" y="22" width="7" height="7" fill="#090d16" />
            <rect x="65" y="23" width="5" height="5" fill="#22c55e" />
            <rect x="69" y="28" width="5" height="7" fill="#090d16" />
            <rect x="70" y="29" width="3" height="5" fill="#16a34a" />

            {/* Low-Left Drooping Frond */}
            <rect x="23" y="27" width="10" height="8" fill="#090d16" />
            <rect x="24" y="28" width="8" height="6" fill="#16a34a" />
            <rect x="15" y="30" width="10" height="8" fill="#090d16" />
            <rect x="16" y="31" width="8" height="6" fill="#22c55e" />
            <rect x="8" y="35" width="9" height="8" fill="#090d16" />
            <rect x="9" y="36" width="7" height="6" fill="#16a34a" />
            <rect x="2" y="41" width="8" height="8" fill="#090d16" />
            <rect x="3" y="42" width="6" height="6" fill="#15803d" />
            <rect x="0" y="48" width="5" height="7" fill="#090d16" />
            <rect x="1" y="49" width="3" height="5" fill="#14532d" />

            {/* Low-Right Drooping Frond */}
            <rect x="43" y="27" width="10" height="8" fill="#090d16" />
            <rect x="44" y="28" width="8" height="6" fill="#16a34a" />
            <rect x="51" y="30" width="10" height="8" fill="#090d16" />
            <rect x="52" y="31" width="8" height="6" fill="#22c55e" />
            <rect x="59" y="35" width="9" height="8" fill="#090d16" />
            <rect x="60" y="36" width="7" height="6" fill="#16a34a" />
            <rect x="66" y="41" width="8" height="8" fill="#090d16" />
            <rect x="67" y="42" width="6" height="6" fill="#15803d" />
            <rect x="71" y="48" width="5" height="7" fill="#090d16" />
            <rect x="72" y="49" width="3" height="5" fill="#14532d" />

            {/* Center Foliage Volume */}
            <rect x="30" y="26" width="16" height="8" fill="#090d16" />
            <rect x="31" y="27" width="14" height="6" fill="#15803d" />
            <rect x="33" y="28" width="10" height="2" fill="#22c55e" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* =========================================================
   SCENIC HORIZONTAL BANNER WITH PALM TREES & BIRDS
   ========================================================= */

export const PixelPalmBanner = ({
  className,
  dark = false,
}: PixelPalmBannerProps) => {
  const sky = dark ? '#071426' : '#dbeafe';
  const ground = dark ? '#78350f' : '#fde68a';
  const grass = dark ? '#064e3b' : '#22c55e';
  const sandDark = dark ? '#451a03' : '#f59e0b';

  return (
    <div
      aria-hidden="true"
      className={`pixel-art pointer-events-none relative overflow-hidden select-none ${className ?? ''}`}
      style={{ backgroundColor: sky }}
    >
      <svg
        viewBox="0 0 200 48"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
        className="h-full w-full"
      >
        {/* Sky Background */}
        <rect x="0" y="0" width="200" height="48" fill={sky} />

        {/* Pixel Sun in Corner */}
        <rect x="180" y="4" width="10" height="10" fill="#f59e0b" />
        <rect x="182" y="6" width="6" height="6" fill="#fef08a" />

        {/* Layered Pixel Clouds */}
        <PixelCloudGlyph x={12} y={2} scale={0.72} dark={dark} />
        <PixelCloudGlyph x={104} y={4} scale={0.6} dark={dark} />

        {/* Beach / Ground Dunes */}
        <rect x="0" y="40" width="200" height="8" fill={sandDark} />
        <rect x="0" y="38" width="200" height="4" fill={ground} />
        <rect x="0" y="42" width="200" height="2" fill={grass} />

        {/* Small Palm Tree 1 */}
        <g transform="translate(6, 4) scale(0.42)">
          <PixelPalmTreeShape />
        </g>

        {/* Medium Palm Tree 2 */}
        <g transform="translate(38, 2) scale(0.46)">
          <PixelPalmTreeShape flip />
        </g>

        {/* Center-Right Palm Tree 3 */}
        <g transform="translate(136, 1) scale(0.48)">
          <PixelPalmTreeShape />
        </g>

        {/* Right Palm Tree 4 */}
        <g transform="translate(172, 3) scale(0.44)">
          <PixelPalmTreeShape flip />
        </g>
      </svg>

      {/* Moving Pixel Birds. Flight and bob use separate wrappers so neither
          transform animation overrides the other. */}
      <div
        className="absolute top-2 left-0 pointer-events-none"
        style={{ animation: 'bird-fly-banner 16s linear infinite' }}
      >
        <div
          className="h-4 w-6"
          style={{ animation: 'bird-flight-bob 1.8s ease-in-out infinite' }}
        >
          <PixelBird variant="seagull" className="h-full w-full" />
        </div>
      </div>

      <div
        className="absolute top-5 left-0 pointer-events-none"
        style={{ animation: 'bird-fly-banner 22s linear infinite 5s' }}
      >
        <div
          className="h-3.5 w-5"
          style={{ animation: 'bird-flight-bob 2.2s ease-in-out infinite' }}
        >
          <PixelBird variant="bluebird" className="h-full w-full" />
        </div>
      </div>

      <div
        className="absolute top-3 left-0 pointer-events-none"
        style={{ animation: 'bird-fly-banner 19s linear infinite 10s' }}
      >
        <div
          className="h-4 w-5"
          style={{ animation: 'bird-flight-bob 1.5s ease-in-out infinite' }}
        >
          <PixelBird variant="parrot" className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FULL-PAGE GAME BACKGROUND SCENERY (PALM TREES & MOVING BIRDS)
   ========================================================= */

/**
 * Background scenery layer for the main game.
 * Renders:
 * - Sunny warm sky with drifting pixel clouds and blocky sun.
 * - Multiple animated pixel birds that move across the screen in authentic Minecraft style.
 * - Lush pixelated palm trees framing the background margins.
 * - Subtle sand dune shore at the base.
 */
export const PixelGameBackground = ({
  className,
}: PixelGameBackgroundProps) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className ?? ''}`}
    >
      {/* 1. Subtle warm sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/50 via-[#faf8f5]/80 to-[#faf8f5]" />

      {/* 2. Blocky Pixel Sun */}
      <div className="absolute top-4 right-6 sm:right-16 md:right-28 opacity-80 pointer-events-none">
        <svg viewBox="0 0 28 28" shapeRendering="crispEdges" className="w-12 h-12 sm:w-16 sm:h-16">
          {/* Outer Sun Rays */}
          <rect x="11" y="0" width="6" height="3" fill="#f59e0b" />
          <rect x="11" y="25" width="6" height="3" fill="#f59e0b" />
          <rect x="0" y="11" width="3" height="6" fill="#f59e0b" />
          <rect x="25" y="11" width="3" height="6" fill="#f59e0b" />
          <rect x="3" y="3" width="4" height="4" fill="#fbbf24" />
          <rect x="21" y="3" width="4" height="4" fill="#fbbf24" />
          <rect x="3" y="21" width="4" height="4" fill="#fbbf24" />
          <rect x="21" y="21" width="4" height="4" fill="#fbbf24" />

          {/* Sun Core */}
          <rect x="5" y="5" width="18" height="18" fill="#f59e0b" />
          <rect x="7" y="7" width="14" height="14" fill="#fbbf24" />
          <rect x="9" y="9" width="10" height="10" fill="#fef08a" />
          <rect x="11" y="11" width="6" height="6" fill="#ffffff" />
        </svg>
      </div>

      {/* 3. Drifting Pixel Clouds in Background Sky */}
      <div
        className="absolute top-8 left-0 opacity-80 pointer-events-none"
        style={{ animation: 'cloud-drift-1 95s linear infinite' }}
      >
        <PixelCloud className="w-36 sm:w-48 h-10" />
      </div>

      <div
        className="absolute top-20 left-0 opacity-70 pointer-events-none"
        style={{ animation: 'cloud-drift-2 130s linear infinite 25s' }}
      >
        <PixelCloud className="w-28 sm:w-36 h-8" />
      </div>

      <div
        className="absolute top-14 left-0 opacity-55 pointer-events-none"
        style={{ animation: 'cloud-drift-2 110s linear infinite 48s' }}
      >
        <PixelCloud className="w-24 sm:w-32 h-7" />
      </div>

      {/* 4. MOVING PIXELATED BIRDS (Flapping Wings + Crossing the Screen).
          Each bird has an outer flight wrapper and an inner bob wrapper so both
          animations run together instead of overriding each other. */}

      {/* Bird 1: Lead Seagull - High Sky (Left to Right) */}
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: '9%', left: 0, animation: 'bird-fly-ltr-1 26s linear infinite' }}
      >
        <div style={{ animation: 'bird-flight-bob 2s ease-in-out infinite' }}>
          <PixelBird variant="seagull" className="w-7 h-5 sm:w-9 sm:h-7" />
        </div>
      </div>

      {/* Bird 2: Scarlet Parrot - Mid Sky (Left to Right with stagger delay) */}
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: '17%', left: 0, animation: 'bird-fly-ltr-2 22s linear infinite 6s' }}
      >
        <div style={{ animation: 'bird-flight-bob 1.6s ease-in-out infinite' }}>
          <PixelBird variant="parrot" className="w-6 h-4 sm:w-8 sm:h-6" />
        </div>
      </div>

      {/* Bird 3: Bluebird - Distant High Sky (Left to Right, smaller scale for depth) */}
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: '25%', left: 0, animation: 'bird-fly-ltr-3 32s linear infinite 14s' }}
      >
        <div style={{ animation: 'bird-flight-bob 2.4s ease-in-out infinite' }}>
          <PixelBird variant="bluebird" className="w-5 h-3.5 sm:w-6 sm:h-4.5" />
        </div>
      </div>

      {/* Bird 4: Distant seagull on its own slower left-to-right path */}
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: '13%', left: 0, animation: 'bird-fly-ltr-4 30s linear infinite 19s' }}
      >
        <div style={{ animation: 'bird-flight-bob 2.2s ease-in-out infinite' }}>
          <PixelBird variant="seagull" className="w-6 h-4 sm:w-7 sm:h-5" />
        </div>
      </div>

      {/* 5. PIXELATED PALM TREES FRAMING THE BACKGROUND */}

      {/* Left Foreground Palm Tree (Large, tall, gentle sway) */}
      <div className="absolute -bottom-4 left-[-18px] sm:left-1 md:left-4 z-0 w-32 sm:w-44 md:w-52 lg:w-60 h-48 sm:h-64 md:h-80 lg:h-96 animate-palm-sway-l opacity-90">
        <PixelPalmTree className="w-full h-full" />
      </div>

      {/* Left Midground Palm Tree (Smaller, behind foreground palm) */}
      <div className="hidden sm:block absolute bottom-0 left-16 md:left-24 lg:left-32 z-0 w-24 sm:w-32 md:w-36 h-36 sm:h-48 md:h-56 animate-palm-sway-r opacity-70">
        <PixelPalmTree flip className="w-full h-full" />
      </div>

      {/* Right Foreground Palm Tree (Large, flipped, gentle sway) */}
      <div className="absolute -bottom-4 right-[-18px] sm:right-1 md:right-4 z-0 w-32 sm:w-44 md:w-52 lg:w-60 h-48 sm:h-64 md:h-80 lg:h-96 animate-palm-sway-r opacity-90">
        <PixelPalmTree flip className="w-full h-full" />
      </div>

      {/* Right Midground Palm Tree (Smaller, behind right palm) */}
      <div className="hidden sm:block absolute bottom-0 right-16 md:right-24 lg:right-32 z-0 w-24 sm:w-32 md:w-36 h-36 sm:h-48 md:h-56 animate-palm-sway-l opacity-70">
        <PixelPalmTree className="w-full h-full" />
      </div>

      {/* 6. Subtle Bottom Shore Dunes with grass tufts */}
      <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-amber-200/40 via-amber-100/20 to-transparent pointer-events-none" />
    </div>
  );
};

const PixelPalmTreeShape = ({
  flip = false,
}: {
  flip?: boolean;
}) => {
  return (
    <g transform={flip ? 'translate(80, 0) scale(-1, 1)' : undefined}>
      {/* Base Sand Mound */}
      <rect x="24" y="88" width="30" height="6" fill="#090d16" />
      <rect x="25" y="89" width="28" height="4" fill="#fbbf24" />
      <rect x="27" y="89" width="14" height="2" fill="#fef08a" />
      <rect x="28" y="91" width="20" height="2" fill="#d97706" />

      {/* Trunk Segments */}
      <rect x="35" y="80" width="11" height="9" fill="#090d16" />
      <rect x="36" y="81" width="9" height="7" fill="#78350f" />
      <rect x="37" y="81" width="3" height="6" fill="#b45309" />
      <rect x="42" y="82" width="2" height="6" fill="#451a03" />

      <rect x="34" y="71" width="11" height="10" fill="#090d16" />
      <rect x="35" y="72" width="9" height="8" fill="#78350f" />
      <rect x="36" y="72" width="3" height="7" fill="#b45309" />
      <rect x="41" y="73" width="2" height="7" fill="#451a03" />

      <rect x="33" y="61" width="11" height="11" fill="#090d16" />
      <rect x="34" y="62" width="9" height="9" fill="#78350f" />
      <rect x="35" y="62" width="3" height="8" fill="#b45309" />
      <rect x="40" y="63" width="2" height="8" fill="#451a03" />

      <rect x="32" y="51" width="11" height="11" fill="#090d16" />
      <rect x="33" y="52" width="9" height="9" fill="#78350f" />
      <rect x="34" y="52" width="3" height="8" fill="#b45309" />
      <rect x="39" y="53" width="2" height="8" fill="#451a03" />

      <rect x="32" y="41" width="11" height="11" fill="#090d16" />
      <rect x="33" y="42" width="9" height="9" fill="#78350f" />
      <rect x="34" y="42" width="3" height="8" fill="#b45309" />
      <rect x="39" y="43" width="2" height="8" fill="#451a03" />

      <rect x="33" y="32" width="10" height="10" fill="#090d16" />
      <rect x="34" y="33" width="8" height="8" fill="#78350f" />
      <rect x="35" y="33" width="3" height="7" fill="#b45309" />

      {/* Coconuts */}
      <rect x="29" y="35" width="7" height="7" fill="#090d16" />
      <rect x="30" y="36" width="5" height="5" fill="#582900" />
      <rect x="31" y="36" width="2" height="2" fill="#92400e" />

      <rect x="38" y="35" width="7" height="7" fill="#090d16" />
      <rect x="39" y="36" width="5" height="5" fill="#582900" />
      <rect x="40" y="36" width="2" height="2" fill="#92400e" />

      <rect x="34" y="40" width="7" height="7" fill="#090d16" />
      <rect x="35" y="41" width="5" height="5" fill="#451a03" />
      <rect x="36" y="41" width="2" height="2" fill="#78350f" />

      {/* Fronds */}
      <rect x="34" y="2" width="8" height="6" fill="#090d16" />
      <rect x="35" y="3" width="6" height="4" fill="#86efac" />
      <rect x="33" y="7" width="10" height="8" fill="#090d16" />
      <rect x="34" y="8" width="8" height="6" fill="#4ade80" />
      <rect x="32" y="14" width="12" height="8" fill="#090d16" />
      <rect x="33" y="15" width="10" height="6" fill="#22c55e" />
      <rect x="32" y="21" width="12" height="8" fill="#090d16" />
      <rect x="33" y="22" width="10" height="6" fill="#16a34a" />

      <rect x="24" y="10" width="10" height="8" fill="#090d16" />
      <rect x="25" y="11" width="8" height="6" fill="#4ade80" />
      <rect x="17" y="13" width="9" height="7" fill="#090d16" />
      <rect x="18" y="14" width="7" height="5" fill="#22c55e" />
      <rect x="10" y="17" width="9" height="7" fill="#090d16" />
      <rect x="11" y="18" width="7" height="5" fill="#4ade80" />
      <rect x="5" y="22" width="7" height="7" fill="#090d16" />
      <rect x="6" y="23" width="5" height="5" fill="#22c55e" />
      <rect x="2" y="28" width="5" height="7" fill="#090d16" />
      <rect x="3" y="29" width="3" height="5" fill="#16a34a" />

      <rect x="42" y="10" width="10" height="8" fill="#090d16" />
      <rect x="43" y="11" width="8" height="6" fill="#4ade80" />
      <rect x="50" y="13" width="9" height="7" fill="#090d16" />
      <rect x="51" y="14" width="7" height="5" fill="#22c55e" />
      <rect x="57" y="17" width="9" height="7" fill="#090d16" />
      <rect x="58" y="18" width="7" height="5" fill="#4ade80" />
      <rect x="64" y="22" width="7" height="7" fill="#090d16" />
      <rect x="65" y="23" width="5" height="5" fill="#22c55e" />
      <rect x="69" y="28" width="5" height="7" fill="#090d16" />
      <rect x="70" y="29" width="3" height="5" fill="#16a34a" />

      <rect x="23" y="27" width="10" height="8" fill="#090d16" />
      <rect x="24" y="28" width="8" height="6" fill="#16a34a" />
      <rect x="15" y="30" width="10" height="8" fill="#090d16" />
      <rect x="16" y="31" width="8" height="6" fill="#22c55e" />
      <rect x="8" y="35" width="9" height="8" fill="#090d16" />
      <rect x="9" y="36" width="7" height="6" fill="#16a34a" />
      <rect x="2" y="41" width="8" height="8" fill="#090d16" />
      <rect x="3" y="42" width="6" height="6" fill="#15803d" />
      <rect x="0" y="48" width="5" height="7" fill="#090d16" />
      <rect x="1" y="49" width="3" height="5" fill="#14532d" />

      <rect x="43" y="27" width="10" height="8" fill="#090d16" />
      <rect x="44" y="28" width="8" height="6" fill="#16a34a" />
      <rect x="51" y="30" width="10" height="8" fill="#090d16" />
      <rect x="52" y="31" width="8" height="6" fill="#22c55e" />
      <rect x="59" y="35" width="9" height="8" fill="#090d16" />
      <rect x="60" y="36" width="7" height="6" fill="#16a34a" />
      <rect x="66" y="41" width="8" height="8" fill="#090d16" />
      <rect x="67" y="42" width="6" height="6" fill="#15803d" />
      <rect x="71" y="48" width="5" height="7" fill="#090d16" />
      <rect x="72" y="49" width="3" height="5" fill="#14532d" />

      <rect x="30" y="26" width="16" height="8" fill="#090d16" />
      <rect x="31" y="27" width="14" height="6" fill="#15803d" />
      <rect x="33" y="28" width="10" height="2" fill="#22c55e" />
    </g>
  );
};
