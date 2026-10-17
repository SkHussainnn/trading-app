import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

const PriceChart = ({
  chartData,
  days = 7,
  onDaysChange,
  coinSymbol = "BTC",
  currentPrice,
  priceChangePercentage,
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Normalize prices array [[timestamp, price], ...]
  const points = useMemo(() => {
    if (!chartData || !chartData.prices || chartData.prices.length === 0) {
      return [];
    }
    return chartData.prices.map(([time, price]) => ({
      time,
      price: Number(price),
    }));
  }, [chartData]);

  const { minPrice, maxPrice, isBullish, priceChange, percentChange } = useMemo(() => {
    if (points.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        isBullish: true,
        priceChange: 0,
        percentChange: 0,
      };
    }

    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;

    return {
      minPrice: min,
      maxPrice: max,
      isBullish: diff >= 0,
      priceChange: diff,
      percentChange: pct,
    };
  }, [points]);

  // Dimensions for SVG
  const width = 800;
  const height = 320;
  const paddingX = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartPoints = useMemo(() => {
    if (points.length < 2) return [];

    const rangeY = maxPrice - minPrice || 1;
    const drawableWidth = width - paddingX * 2;
    const drawableHeight = height - paddingTop - paddingBottom;

    return points.map((p, index) => {
      const x = paddingX + (index / (points.length - 1)) * drawableWidth;
      const y =
        paddingTop + drawableHeight - ((p.price - minPrice) / rangeY) * drawableHeight;
      return { x, y, price: p.price, time: p.time };
    });
  }, [points, minPrice, maxPrice]);

  // Construct SVG Path
  const { pathD, areaD } = useMemo(() => {
    if (chartPoints.length < 2) return { pathD: "", areaD: "" };

    const first = chartPoints[0];
    let d = `M ${first.x} ${first.y}`;

    for (let i = 1; i < chartPoints.length; i++) {
      const curr = chartPoints[i];
      const prev = chartPoints[i - 1];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const last = chartPoints[chartPoints.length - 1];
    const area = `${d} L ${last.x} ${height - paddingBottom} L ${first.x} ${
      height - paddingBottom
    } Z`;

    return { pathD: d, areaD: area };
  }, [chartPoints]);

  const activePoint =
    hoverIndex !== null && chartPoints[hoverIndex]
      ? chartPoints[hoverIndex]
      : chartPoints[chartPoints.length - 1];

  const handleMouseMove = (e) => {
    if (chartPoints.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    // Find nearest point
    let closestIndex = 0;
    let minDistance = Infinity;

    chartPoints.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
  };

  const strokeColor = isBullish ? "#10b981" : "#f43f5e";
  const glowId = isBullish ? "glow-green" : "glow-red";
  const gradientId = isBullish ? "bullish-gradient" : "bearish-gradient";

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col">
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
              {coinSymbol.toUpperCase()} / USD Price Chart
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                isBullish
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isBullish ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isBullish ? "+" : ""}
              {percentChange.toFixed(2)}% ({days}D)
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-white">
              ${activePoint ? activePoint.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : currentPrice?.toLocaleString()}
            </span>
            {activePoint && (
              <span className="text-xs text-neutral-400 font-mono">
                {new Date(activePoint.time).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-neutral-950/80 p-1 rounded-xl border border-neutral-800/80 gap-1 text-xs font-medium">
          {[
            { label: "24H", value: 1 },
            { label: "7D", value: 7 },
            { label: "30D", value: 30 },
            { label: "1Y", value: 365 },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => onDaysChange && onDaysChange(t.value)}
              className={`px-3 py-1.5 rounded-lg transition ${
                days === t.value
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div
        className="relative w-full h-[320px] select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {chartPoints.length < 2 ? (
          <div className="h-full flex items-center justify-center text-sm text-neutral-500">
            Loading chart telemetry...
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="bullish-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="bearish-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10b981" floodOpacity="0.5" />
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Grid Lines */}
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={width - paddingX}
              y2={paddingTop}
              stroke="#262626"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="#262626"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height - paddingBottom}
              x2={width - paddingX}
              y2={height - paddingBottom}
              stroke="#262626"
            />

            {/* High/Low Markers */}
            <text
              x={width - paddingX}
              y={paddingTop + 12}
              fill="#737373"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="end"
            >
              High: ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </text>
            <text
              x={width - paddingX}
              y={height - paddingBottom - 8}
              fill="#737373"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="end"
            >
              Low: ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </text>

            {/* Area Fill */}
            <path d={areaD} fill={`url(#${gradientId})`} />

            {/* Line Stroke */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
            />

            {/* Crosshair on Hover */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={height - paddingBottom}
                  stroke="#525252"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="5.5"
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth="3"
                />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Chart Footer Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800/70 text-xs">
        <div>
          <span className="text-neutral-500">24h Low / High</span>
          <p className="font-mono text-neutral-200 mt-0.5">
            ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} - $
            {maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-neutral-500">Period Change</span>
          <p
            className={`font-mono font-medium mt-0.5 ${
              isBullish ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isBullish ? "+$" : "-$"}
            {Math.abs(priceChange).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div>
          <span className="text-neutral-500">Timeframe</span>
          <p className="font-mono text-neutral-200 mt-0.5">{days} Days Historical</p>
        </div>
        <div>
          <span className="text-neutral-500">Data Source</span>
          <p className="font-mono text-cyan-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Realtime Ticker Feed
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
