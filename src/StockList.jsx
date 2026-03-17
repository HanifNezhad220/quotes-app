import { useState, useRef } from "react";
import Sparkline from "./Sparkline";

function fmt(price) {
  if (price >= 1000) return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price < 10) return price.toFixed(3);
  return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

export default function StockList({ stocks, selected, onSelect, onRemove, onAdd, onReorder }) {
  const [query, setQuery] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragNode = useRef(null);

  const trimmed = query.trim();
  const filtered = trimmed
    ? stocks.filter(
        (s) =>
          s.ticker.toLowerCase().includes(trimmed.toLowerCase()) ||
          s.name.toLowerCase().includes(trimmed.toLowerCase())
      )
    : stocks;

  const exactMatch = stocks.some(
    (s) => s.ticker.toLowerCase() === trimmed.toLowerCase()
  );
  const showAddRow = trimmed.length > 0 && !exactMatch;

  // ── Drag & drop (only active when no search query) ──
  function handleDragStart(e, index) {
    setDragIndex(index);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnter(e, index) {
    e.preventDefault();
    if (index !== dragIndex) setOverIndex(index);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, index) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorder(dragIndex, index);
    }
    resetDrag();
  }

  function handleDragEnd() {
    resetDrag();
  }

  function resetDrag() {
    setDragIndex(null);
    setOverIndex(null);
    dragNode.current = null;
  }

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">Stocks</span>
      </div>

      {/* Symbol search — doubles as add */}
      <div className="symbol-search-wrap">
        <div className={`symbol-search ${trimmed ? "symbol-search--filled" : ""}`}>
          <span className="symbol-search__label">Symbol</span>
          <input
            className="symbol-search__input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && showAddRow) {
                onAdd(trimmed);
                setQuery("");
              }
              if (e.key === "Escape") setQuery("");
            }}
            spellCheck={false}
            autoComplete="off"
          />
          {trimmed && (
            <button className="symbol-search__clear" onClick={() => setQuery("")}>×</button>
          )}
        </div>
      </div>

      {/* Stock rows */}
      <div className="stock-list">
        {filtered.map((s, i) => {
          const pos = s.change >= 0;
          const isSelected = selected?.ticker === s.ticker;
          const isDragging = dragIndex === i;
          const isOver = overIndex === i;
          const canDrag = !trimmed; // disable drag when searching

          return (
            <div
              key={s.ticker}
              className={[
                "stock-row",
                isSelected ? "stock-row--selected" : "",
                isDragging ? "stock-row--dragging" : "",
                isOver ? "stock-row--over" : "",
                canDrag ? "stock-row--draggable" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelect(s)}
              draggable={canDrag}
              onDragStart={canDrag ? (e) => handleDragStart(e, i) : undefined}
              onDragEnter={canDrag ? (e) => handleDragEnter(e, i) : undefined}
              onDragOver={canDrag ? handleDragOver : undefined}
              onDrop={canDrag ? (e) => handleDrop(e, i) : undefined}
              onDragEnd={canDrag ? handleDragEnd : undefined}
            >
              {canDrag && (
                <span className="stock-drag-handle">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                    <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
                    <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
                    <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
                  </svg>
                </span>
              )}
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
              <button
                className="stock-delete-btn"
                title={`Remove ${s.ticker}`}
                onClick={(e) => { e.stopPropagation(); onRemove(s.ticker); }}
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && !showAddRow && (
          <div className="stock-list__empty">No results for "{trimmed}"</div>
        )}

        {/* Add row — shown when query has no exact match */}
        {showAddRow && (
          <div
            className="stock-add-row"
            onClick={() => { onAdd(trimmed); setQuery(""); }}
          >
            <span className="stock-add-row__plus">+</span>
            <span>Add <strong>{trimmed.toUpperCase()}</strong> to watchlist</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="market-status">Market Closed</span>
      </div>
    </div>
  );
}
