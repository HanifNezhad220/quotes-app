import { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { newsArticles } from "./data";
import PositionsPanel from "./PositionsPanel";

const SECTIONS = ["Gamma Exposure (GEX)", "Positions & Bots", "Market Depth"];
const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "5Y", "10Y", "ALL"];

function genDepthData(mid) {
  const levels = 28;
  const step = mid * 0.0008;
  const bids = [];
  let bidCum = 0;
  for (let i = levels; i >= 1; i--) {
    bidCum += Math.random() * 60 + 8;
    bids.unshift({ price: +(mid - i * step).toFixed(2), bid: +bidCum.toFixed(0) });
  }
  const asks = [];
  let askCum = 0;
  for (let i = 1; i <= levels; i++) {
    askCum += Math.random() * 60 + 8;
    asks.push({ price: +(mid + i * step).toFixed(2), ask: +askCum.toFixed(0) });
  }
  return [...bids, { price: +mid.toFixed(2), bid: 0, ask: 0 }, ...asks];
}

function genVolumeData(mid) {
  const levels = 28;
  const step = mid * 0.0008;
  const puts = [];
  let putCum = 0;
  for (let i = levels; i >= 1; i--) {
    putCum += Math.random() * 800 + 100;
    puts.unshift({ price: +(mid - i * step).toFixed(2), put_vol: +putCum.toFixed(0) });
  }
  const calls = [];
  let callCum = 0;
  for (let i = 1; i <= levels; i++) {
    callCum += Math.random() * 800 + 100;
    calls.push({ price: +(mid + i * step).toFixed(2), call_vol: +callCum.toFixed(0) });
  }
  return [...puts, { price: +mid.toFixed(2), put_vol: 0, call_vol: 0 }, ...calls];
}

function genOIData(mid) {
  const levels = 28;
  const step = mid * 0.0008;
  const puts = [];
  let putCum = 0;
  for (let i = levels; i >= 1; i--) {
    putCum += Math.random() * 2000 + 300;
    puts.unshift({ price: +(mid - i * step).toFixed(2), put_oi: +putCum.toFixed(0) });
  }
  const calls = [];
  let callCum = 0;
  for (let i = 1; i <= levels; i++) {
    callCum += Math.random() * 2000 + 300;
    calls.push({ price: +(mid + i * step).toFixed(2), call_oi: +callCum.toFixed(0) });
  }
  return [...puts, { price: +mid.toFixed(2), put_oi: 0, call_oi: 0 }, ...calls];
}

function StatRow({ items }) {
  return (
    <div className="stat-row">
      {items.map(([label, value]) => (
        <div key={label} className="stat-item">
          <span className="stat-label">{label}</span>
          <span className="stat-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value;
    if (val == null) return null;
    return (
      <div className="chart-tooltip">
        <span>{Number(val).toFixed(2)}</span>
      </div>
    );
  }
  return null;
};


const METRIC_CONFIG = {
  bid_ask:       { left: "bid",     right: "ask",      leftLabel: "Bid",      rightLabel: "Ask"      },
  volume:        { left: "put_vol", right: "call_vol",  leftLabel: "Put Vol",  rightLabel: "Call Vol"  },
  open_interest: { left: "put_oi",  right: "call_oi",   leftLabel: "Put OI",   rightLabel: "Call OI"   },
};

const DepthTooltipMetric = ({ active, payload, metric }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const cfg = METRIC_CONFIG[metric];
  const side = d[cfg.left] > 0 ? cfg.leftLabel : d[cfg.right] > 0 ? cfg.rightLabel : null;
  const vol = d[cfg.left] > 0 ? d[cfg.left] : d[cfg.right];
  if (!side) return null;
  const isLeft = side === cfg.leftLabel;
  return (
    <div className="chart-tooltip">
      <span style={{ color: isLeft ? "#30d158" : "#ff453a" }}>{side}</span>
      <span style={{ marginLeft: 6 }}>{vol?.toLocaleString()}</span>
    </div>
  );
};

function DepthChart({ data, metric = "bid_ask" }) {
  const cfg = METRIC_CONFIG[metric];
  return (
    <div className="trading-chart-area">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#30d158" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#30d158" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff453a" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ff453a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="price" tick={{ fill: "#636366", fontSize: 10 }} tickLine={false} axisLine={false} interval={7} tickFormatter={(v) => `$${v}`} />
          <YAxis tick={{ fill: "#636366", fontSize: 10 }} tickLine={false} axisLine={false} width={36} orientation="right" />
          <Tooltip content={<DepthTooltipMetric metric={metric} />} cursor={{ stroke: "#636366", strokeWidth: 1 }} />
          <Area type="stepAfter" dataKey={cfg.left}  stroke="#30d158" strokeWidth={1.5} fill="url(#leftGrad)"  dot={false} connectNulls={false} activeDot={{ r: 3, fill: "#30d158", strokeWidth: 0 }} />
          <Area type="stepBefore" dataKey={cfg.right} stroke="#ff453a" strokeWidth={1.5} fill="url(#rightGrad)" dot={false} connectNulls={false} activeDot={{ r: 3, fill: "#ff453a", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── GEX Table ────────────────────────────────────────────────────────────────

function getStrikeStep(price) {
  if (price > 1000) return 10;
  if (price > 500)  return 5;
  if (price > 200)  return 2.5;
  if (price > 50)   return 1;
  return 0.5;
}

const EXPIRATIONS = [
  { key: "2026-03-20", label: "Mar 20", type: "Weekly" },
  { key: "2026-03-27", label: "Mar 27", type: "Weekly" },
  { key: "2026-04-03", label: "Apr 03", type: "Weekly" },
  { key: "2026-04-17", label: "Apr 17", type: "Monthly" },
  { key: "2026-04-24", label: "Apr 24", type: "Weekly" },
  { key: "2026-05-15", label: "May 15", type: "Monthly" },
  { key: "2026-06-19", label: "Jun 19", type: "Monthly" },
  { key: "2026-09-18", label: "Sep 18", type: "Monthly" },
];

function genGEXMatrix(mid) {
  const step = getStrikeStep(mid);
  const atm = Math.round(mid / step) * step;
  const strikes = Array.from({ length: 13 }, (_, i) =>
    parseFloat((atm + (6 - i) * step).toFixed(2)) // highest at top
  );
  const matrix = {};
  let maxAbs = 0;
  strikes.forEach((strike) => {
    matrix[strike] = {};
    EXPIRATIONS.forEach(({ key }) => {
      const base = (Math.random() - 0.5) * 5;
      const spike = Math.random() < 0.1 ? (Math.random() - 0.5) * 22 : 0;
      const val = parseFloat((base + spike).toFixed(2));
      matrix[strike][key] = val;
      if (Math.abs(val) > maxAbs) maxAbs = Math.abs(val);
    });
  });
  return { strikes, matrix, maxAbs };
}

function cellBg(value, maxAbs, heatmap) {
  if (value === 0) return "transparent";
  const t = Math.min(Math.abs(value) / maxAbs, 1);
  const alpha = heatmap ? 0.15 + t * 0.75 : 0.08 + t * 0.55;
  return value > 0
    ? `rgba(90, 148, 175, ${alpha.toFixed(2)})`
    : `rgba(255, 69, 58, ${alpha.toFixed(2)})`;
}

function generateGEXAnalysis(strike, expiry, value, atmStrike) {
  const exp = EXPIRATIONS.find(e => e.key === expiry);
  const absVal = Math.abs(value);
  const isPositive = value >= 0;
  const strikeDiff = ((strike - atmStrike) / atmStrike * 100).toFixed(1);
  const isATM = strike === atmStrike;
  const isITM = strike < atmStrike;
  const zone = isATM ? "at-the-money" : isITM ? "in-the-money" : "out-of-the-money";
  const magnitude = absVal > 10 ? "very large" : absVal > 4 ? "large" : absVal > 1 ? "moderate" : "small";
  const direction = isPositive ? "positive" : "negative";

  return {
    summary: isPositive
      ? `Call gamma dominates at this strike, meaning market makers are net long gamma here.`
      : `Put gamma dominates at this strike, meaning market makers are net short gamma here.`,
    what: isPositive
      ? `A ${direction} GEX of ${value.toFixed(2)}M at $${strike} (${exp?.label}) indicates that dealers hold more call gamma than put gamma. As the underlying approaches this strike, dealers will sell into rallies and buy dips to stay delta-neutral — creating a gravitational pull toward $${strike}.`
      : `A ${direction} GEX of ${value.toFixed(2)}M at $${strike} (${exp?.label}) indicates that dealers are short gamma here. As price moves toward this strike, dealers must chase the move — selling into drops and buying into rallies — which accelerates and amplifies price movement.`,
    impact: isPositive
      ? `Price tends to pin or slow near $${strike}. Expect compressed volatility and mean-reversion behavior around this level ${isATM ? "— particularly significant as this is the current ATM strike" : `(${Math.abs(strikeDiff)}% ${isITM ? "below" : "above"} current price)`}.`
      : `Price may accelerate through $${strike} if reached. This is a ${magnitude} negative GEX node — the larger the value, the more dealers amplify moves. Volatility tends to expand in this zone.`,
    magnitude: `${magnitude.charAt(0).toUpperCase() + magnitude.slice(1)} exposure (${value.toFixed(2)}M). The ${zone} position ${isATM ? "makes this the most relevant level to watch." : `places this ${Math.abs(strikeDiff)}% ${strike > atmStrike ? "above" : "below"} spot price.`}`,
  };
}

function GEXCellPopover({ strike, expiry, value, flipUp, onClose, onAnalyze }) {
  const ref = useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const exp = EXPIRATIONS.find(e => e.key === expiry);
  return (
    <div className="gex-popover" ref={ref} style={flipUp ? { top: "auto", bottom: "calc(100% + 8px)" } : {}}>
      <div className="gex-popover__header">
        <span className="gex-popover__strike">${strike.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        <span className="gex-popover__expiry">{exp?.label}</span>
        <span className={`gex-popover__val ${value >= 0 ? "pos" : "neg"}`}>{value >= 0 ? "+" : ""}{value.toFixed(2)}M GEX</span>
      </div>
      <div className="gex-popover__actions">
        <button className="gex-popover__btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
          Create Entry Bot
        </button>
        <button className="gex-popover__btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
          </svg>
          Trade
        </button>
        <button className="gex-popover__btn gex-popover__btn--ai" onClick={() => { onAnalyze(); onClose(); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="18" cy="5" r="3" fill="currentColor" stroke="none"/>
          </svg>
          Analyze with AI
        </button>
      </div>
    </div>
  );
}

function GEXAnalysisPanel({ analysis, cell, onClose }) {
  const exp = EXPIRATIONS.find(e => e.key === cell.expiry);
  return (
    <div className="gex-analysis-panel">
      <div className="gex-analysis-header">
        <div className="gex-analysis-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="18" cy="5" r="3" fill="currentColor" stroke="none"/>
          </svg>
          AI Analysis
        </div>
        <button className="gex-analysis-close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="gex-analysis-meta">
        <span className="gex-analysis-strike">${cell.strike.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        <span className="gex-analysis-sep">·</span>
        <span className="gex-analysis-expiry">{exp?.label} {exp?.type}</span>
        <span className="gex-analysis-sep">·</span>
        <span className={`gex-analysis-gex ${cell.value >= 0 ? "pos" : "neg"}`}>
          {cell.value >= 0 ? "+" : ""}{cell.value.toFixed(2)}M GEX
        </span>
      </div>

      <div className="gex-analysis-body">
        <p className="gex-analysis-summary">{analysis.summary}</p>

        <div className="gex-analysis-section">
          <div className="gex-analysis-section-label">What this means</div>
          <p>{analysis.what}</p>
        </div>

        <div className="gex-analysis-section">
          <div className="gex-analysis-section-label">Price impact</div>
          <p>{analysis.impact}</p>
        </div>

        <div className="gex-analysis-section">
          <div className="gex-analysis-section-label">Magnitude</div>
          <p>{analysis.magnitude}</p>
        </div>
      </div>

      <div className="gex-analysis-footer">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        Simulated analysis — connect to AI for real insights
      </div>
    </div>
  );
}

function GEXTable({ mid }) {
  const { strikes, matrix, maxAbs } = useMemo(() => genGEXMatrix(mid), [mid]);
  const atmStrike = useMemo(() => {
    const step = getStrikeStep(mid);
    return parseFloat((Math.round(mid / step) * step).toFixed(2));
  }, [mid]);
  const [activeCell, setActiveCell] = useState(null);
  const [analysisCell, setAnalysisCell] = useState(null);

  const analysis = useMemo(
    () => analysisCell ? generateGEXAnalysis(analysisCell.strike, analysisCell.expiry, analysisCell.value, atmStrike) : null,
    [analysisCell, atmStrike]
  );

  return (
    <div className="gex-wrap">
      <div className="gex-toolbar">
        <div className="gex-legend">
          <span className="gex-legend__pos">▲ Call dominated</span>
          <span className="gex-legend__neg">▼ Put dominated</span>
        </div>
        <div className="gex-zone-legend">
          <span className="gex-zone-legend__atm">ATM</span>
        </div>
      </div>

      <div className={`gex-content ${analysisCell ? "gex-content--split" : ""}`}>
        <div className="gex-table-wrap" style={{ position: "relative" }}>
          <table className="gex-table">
            <thead>
              <tr>
                <th className="gex-th gex-th--strike">Strike</th>
                {EXPIRATIONS.map(({ key, label, type }) => (
                  <th key={key} className="gex-th">
                    <span className="gex-exp-label">{label}</span>
                    <span className="gex-exp-type">{type}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {strikes.map((strike) => {
                const isATM = strike === atmStrike;
                const isITM = strike < atmStrike;
                const zoneClass = isATM ? "gex-tr--atm" : isITM ? "gex-tr--itm" : "gex-tr--otm";
                return (
                  <tr key={strike} className={`gex-tr ${zoneClass}`}>
                    <td className="gex-td gex-td--strike">
                      <span className="gex-strike-price">
                        ${strike.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    {EXPIRATIONS.map(({ key }) => {
                      const val = matrix[strike][key];
                      const isActive = activeCell?.strike === strike && activeCell?.expiry === key;
                      return (
                        <td
                          key={key}
                          className={`gex-td gex-td--clickable ${isActive ? "gex-td--active" : ""}`}
                          style={{ background: cellBg(val, maxAbs, false) }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const flipUp = window.innerHeight - rect.bottom < 200;
                            setActiveCell(isActive ? null : { strike, expiry: key, value: val, flipUp });
                          }}
                        >
                          {val.toFixed(2)}
                          {isActive && (
                            <GEXCellPopover
                              strike={strike}
                              expiry={key}
                              value={val}
                              flipUp={activeCell?.flipUp}
                              onClose={() => setActiveCell(null)}
                              onAnalyze={() => setAnalysisCell({ strike, expiry: key, value: val })}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {analysisCell && analysis && (
          <GEXAnalysisPanel
            analysis={analysis}
            cell={analysisCell}
            onClose={() => setAnalysisCell(null)}
          />
        )}
      </div>

      <div className="gex-footnote">Values in $ millions · Net GEX = Calls − Puts · Dummy data</div>
    </div>
  );
}

function TickerNews() {
  return (
    <div className="trading-right">
      <div className="ticker-news-header">Ticker News</div>
      <div className="ticker-news-list">
        {newsArticles.slice(0, 3).map((article, i) => (
          <div key={i} className="ticker-news-card">
            <div className="news-source">{article.source}</div>
            <div className="news-title">{article.title}</div>
            <div className="news-desc">{article.desc}</div>
            <div className="news-date">{article.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StockChart({ stock }) {
  const [period, setPeriod] = useState("1D");
  const [section, setSection] = useState("Gamma Exposure (GEX)");
  const [chartView, setChartView] = useState("options");
  const [depthMetric, setDepthMetric] = useState("bid_ask");

  const mid = stock?.atClose ?? 100;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionsBidAsk   = useMemo(() => genDepthData(mid),   [stock?.ticker]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionsVolume   = useMemo(() => genVolumeData(mid),  [stock?.ticker]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionsOI       = useMemo(() => genOIData(mid),      [stock?.ticker]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const underlyingDepthData = useMemo(() => genDepthData(mid), [stock?.ticker]);

  const optionsDataMap = { bid_ask: optionsBidAsk, volume: optionsVolume, open_interest: optionsOI };
  const depthData = chartView === "options" ? optionsDataMap[depthMetric] : underlyingDepthData;
  const activeMetric = chartView === "options" ? depthMetric : "bid_ask";

  if (!stock) return null;

  const isUp = stock.change >= 0;
  const color = isUp ? "#30d158" : "#ff453a";
  const gradId = isUp ? "greenGrad" : "redGrad";
  const open = stock.chartData[0]?.price ?? stock.open;

  return (
    <div className="chart-panel">
      {/* Stock header */}
      <div className="chart-header">
        <div className="chart-header__left">
          <div className="chart-ticker">{stock.ticker}</div>
          <div className="chart-fullname">{stock.fullName}</div>
          <div className="chart-exchange">{stock.exchange}</div>
        </div>
        <div className="chart-header__right">
          <div className="price-block">
            <span className="price-main">{stock.atClose.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`price-change ${stock.atCloseChange >= 0 ? "text-green" : "text-red"}`}>
              {stock.atCloseChange >= 0 ? "+" : ""}{stock.atCloseChange.toFixed(2)}%
            </span>
            <span className="price-label">At Close</span>
          </div>
          <div className="price-block price-block--right">
            <span className="price-main">{stock.preMarket.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`price-change ${stock.preMarketChange >= 0 ? "text-green" : "text-red"}`}>
              {stock.preMarketChange >= 0 ? "+" : ""}{stock.preMarketChange.toFixed(2)}%
            </span>
            <span className="price-label">Pre-Market</span>
          </div>
        </div>
      </div>

      {/* Period tabs + quick actions row */}
      <div className="period-tabs-row">
        <div className="period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`period-tab ${period === p ? "period-tab--active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="quick-actions">
          <button className="quick-action-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            Create Entry Bot
          </button>
          <button className="quick-action-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            Simulate Symbol
          </button>
          <button className="quick-action-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            Explore Option Chains
          </button>
        </div>
      </div>

      {/* Price Chart */}
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stock.chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff453a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ff453a" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#30d158" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#30d158" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: "#636366", fontSize: 11 }} tickLine={false} axisLine={false} interval={11} tickFormatter={(v) => v} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "#636366", fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => v.toFixed(0)} orientation="right" />
            <ReferenceLine y={open} stroke="#48484a" strokeDasharray="3 3" strokeWidth={1} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#636366", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatRow items={[
          ["Open", stock.open.toLocaleString("en-US")],
          ["Vol", stock.vol],
          ["52W H", stock.wkHigh52],
          ["Yield", stock.yield],
        ]} />
        <StatRow items={[
          ["High", stock.high.toLocaleString("en-US")],
          ["P/E", stock.pe],
          ["52W L", stock.wkLow52],
          ["Beta", stock.beta],
        ]} />
        <StatRow items={[
          ["Low", stock.low.toLocaleString("en-US")],
          ["Mkt Cap", stock.mktCap],
          ["Avg Vol", stock.avgVol],
          ["EPS", stock.eps],
        ]} />
      </div>

      {/* ── Bottom trading panel ── */}
      <div className="trading-panel">
        {/* Section tabs */}
        <div className="section-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s}
              className={`section-tab ${section === s ? "section-tab--active" : ""}`}
              onClick={() => setSection(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Gamma Exposure — full width GEX table */}
        {section === "Gamma Exposure (GEX)" && (
          <GEXTable mid={stock.atClose} />
        )}

        {/* Two-column body */}
        {section !== "Gamma Exposure (GEX)" && (
        <div className="trading-body">
          {/* Left column */}
          <div className="trading-left">
            {section === "Positions & Bots" ? (
              <PositionsPanel />
            ) : (
              <>
                <div className="depth-controls">
                  <div className="chart-view-toggle">
                    <button
                      className={`cvt-btn ${chartView === "options" ? "cvt-btn--active" : ""}`}
                      onClick={() => setChartView("options")}
                    >
                      Options
                    </button>
                    <button
                      className={`cvt-btn ${chartView === "underlying" ? "cvt-btn--active" : ""}`}
                      onClick={() => setChartView("underlying")}
                    >
                      Underlying
                    </button>
                  </div>
                  {chartView === "options" && (
                    <div className="depth-metric-select-wrap">
                      <select
                        className="depth-metric-select"
                        value={depthMetric}
                        onChange={(e) => setDepthMetric(e.target.value)}
                      >
                        <option value="bid_ask">Bid / Ask Size</option>
                        <option value="volume">Volume</option>
                        <option value="open_interest">Open Interest</option>
                      </select>
                      <svg className="depth-metric-select__arrow" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="depth-mid-label">
                  <span className="depth-mid-price">
                    {stock.atClose.toLocaleString("de-DE", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                  </span>
                  <span className="depth-mid-sub">Mid Market Price</span>
                </div>
                <div className="delay-badge-wrap">
                  <div className="delay-badge">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1.1"/>
                      <path d="M5.5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                    15 min delayed
                  </div>
                  <div className="delay-tooltip">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M7 2v10" stroke="#5a94af" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M4 4l6 6M10 4L4 10" stroke="#5a94af" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
                    </svg>
                    <div className="delay-tooltip__text">
                      <span className="delay-tooltip__title">15 minutes delayed data</span>
                      <span className="delay-tooltip__sub">
                        Connect your broker account to switch to real-time live market data.
                      </span>
                      <button className="delay-tooltip__btn">Connect Broker Account</button>
                    </div>
                  </div>
                </div>
                <DepthChart data={depthData} metric={activeMetric} />
              </>
            )}
          </div>

          {/* Right column: Ticker News */}
          <TickerNews />
        </div>
        )}
      </div>
    </div>
  );
}
