import { useState } from "react";
import Sparkline from "./Sparkline";

function fmt(price) {
  if (price >= 1000) return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price < 10) return price.toFixed(3);
  return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StockList({ stocks, selected, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? stocks.filter(
        (s) =>
          s.ticker.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : stocks;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">Stocks</span>
      </div>

      {/* Symbol search */}
      <div className="symbol-search-wrap">
        <div className={`symbol-search ${query ? "symbol-search--filled" : ""}`}>
          <span className="symbol-search__label">Symbol</span>
          <input
            className="symbol-search__input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Stock rows */}
      <div className="stock-list">
        {filtered.length === 0 ? (
          <div className="stock-list__empty">No results for "{query}"</div>
        ) : (
          filtered.map((s) => {
            const pos = s.change >= 0;
            const isSelected = selected?.ticker === s.ticker;
            return (
              <div
                key={s.ticker}
                className={`stock-row ${isSelected ? "stock-row--selected" : ""}`}
                onClick={() => onSelect(s)}
              >
                <div className="stock-row__left">
                  <span className="stock-ticker">{s.ticker}</span>
                  <span className="stock-name">{s.name}</span>
                </div>
                <div className="stock-row__mid">
                  <Sparkline data={s.sparkline} positive={pos} />
                </div>
                <div className="stock-row__right">
                  <span className="stock-price">{fmt(s.price)}</span>
                  <span className={`stock-change-badge ${pos ? "badge--green" : "badge--red"}`}>
                    {pos ? "+" : ""}{s.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="market-status">Market Closed</span>
      </div>
    </div>
  );
}
