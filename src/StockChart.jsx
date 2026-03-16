import { useState, useMemo } from "react";
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

const SECTIONS = ["Market Depth", "Positions & Bots", "Options Chain", "Underlying"];
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

const DepthTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const side = d.bid > 0 ? "Bid" : d.ask > 0 ? "Ask" : null;
  const vol = d.bid > 0 ? d.bid : d.ask;
  if (!side) return null;
  return (
    <div className="chart-tooltip">
      <span style={{ color: side === "Bid" ? "#30d158" : "#ff453a" }}>{side}</span>
      <span style={{ marginLeft: 6 }}>{vol}</span>
    </div>
  );
};

function DepthChart({ data }) {
  return (
    <div className="trading-chart-area">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#30d158" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#30d158" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff453a" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ff453a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="price" tick={{ fill: "#636366", fontSize: 10 }} tickLine={false} axisLine={false} interval={7} tickFormatter={(v) => `$${v}`} />
          <YAxis tick={{ fill: "#636366", fontSize: 10 }} tickLine={false} axisLine={false} width={36} orientation="right" />
          <Tooltip content={<DepthTooltip />} cursor={{ stroke: "#636366", strokeWidth: 1 }} />
          <Area type="stepAfter" dataKey="bid" stroke="#30d158" strokeWidth={1.5} fill="url(#bidGrad)" dot={false} connectNulls={false} activeDot={{ r: 3, fill: "#30d158", strokeWidth: 0 }} />
          <Area type="stepBefore" dataKey="ask" stroke="#ff453a" strokeWidth={1.5} fill="url(#askGrad)" dot={false} connectNulls={false} activeDot={{ r: 3, fill: "#ff453a", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
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
  const [section, setSection] = useState("Market Depth");
  const [chartView, setChartView] = useState("options");

  const optionsDepthData = useMemo(
    () => genDepthData(stock?.atClose ?? 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stock?.ticker]
  );

  const underlyingDepthData = useMemo(
    () => genDepthData(stock?.atClose ?? 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stock?.ticker]
  );

  if (!stock) return null;

  const isUp = stock.change >= 0;
  const color = isUp ? "#30d158" : "#ff453a";
  const gradId = isUp ? "greenGrad" : "redGrad";
  const open = stock.chartData[0]?.price ?? stock.open;
  const depthData = chartView === "options" ? optionsDepthData : underlyingDepthData;

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

      {/* Period tabs */}
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

        {/* Two-column body */}
        <div className="trading-body">
          {/* Left column */}
          <div className="trading-left">
            {section === "Positions & Bots" ? (
              <PositionsPanel />
            ) : (
              <>
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
                <DepthChart data={depthData} />
              </>
            )}
          </div>

          {/* Right column: Ticker News */}
          <TickerNews />
        </div>
      </div>
    </div>
  );
}
