/**
 * Inline pixel-art scenery. Everything is drawn with SVG rectangles so the
 * game keeps its crunchy arcade look without downloading image assets.
 */

type PixelForestProps = {
  className?: string | undefined;
  dark?: boolean | undefined;
};

type TreeColors = {
  outline: string;
  light: string;
  mid: string;
  dark: string;
  shadow: string;
  trunk: string;
  trunkLight: string;
};

type TreePlacement = {
  x: number;
  y: number;
  scale?: number | undefined;
};

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

/** Horizontal pixel-forest strip used in the feed, loader, and game screens. */
export const PixelForest = ({ className, dark = false }: PixelForestProps) => {
  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  const sky = dark ? '#071426' : '#dbeafe';
  const cloud = dark ? '#14304d' : '#ffffff';
  const ground = dark ? '#0f3d2e' : '#86efac';
  const grass = dark ? '#064e3b' : '#22c55e';
  const flower = dark ? '#fcd34d' : '#fbbf24';

  return (
    <div
      aria-hidden="true"
      className={`pixel-art pointer-events-none overflow-hidden ${className ?? ''}`}
    >
      <svg
        viewBox="0 0 160 40"
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        className="h-full w-full"
      >
        <rect x="0" y="0" width="160" height="40" fill={sky} />
        <g fill={cloud}>
          <rect x="14" y="6" width="20" height="4" />
          <rect x="18" y="4" width="12" height="4" />
          <rect x="16" y="10" width="16" height="2" />
          <rect x="104" y="8" width="18" height="4" />
          <rect x="108" y="6" width="10" height="4" />
          <rect x="106" y="12" width="14" height="2" />
        </g>
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
