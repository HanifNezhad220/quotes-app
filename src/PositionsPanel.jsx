import { useState } from "react";
import { mockPositions } from "./data";

function SideBadge({ side }) {
  return (
    <span className={`side-badge side-badge--${side.toLowerCase()}`}>{side}</span>
  );
}

function BotCard({ bot }) {
  return (
    <div className="bot-card">
      <div className="bot-card__header">
        <span className="bot-leg-title">{bot.leg}</span>
        <SideBadge side={bot.side} />
      </div>

      <div className={`bot-since ${bot.positive ? "text-green" : "text-red"}`}>
        {bot.sinceLabel}: <strong>{bot.sincePct}%</strong>
      </div>

      <div className="bot-action">
        <SideBadge side={bot.actionSide} />
        <div className="bot-action__text">
          <span className="bot-action__leg">{bot.actionLeg}</span>
          {bot.actionType === "Roll" ? (
            <span className="bot-action__detail">
              Roll <strong>1</strong> to{" "}
              <strong className="text-blue">{bot.actionDetail}</strong>
            </span>
          ) : (
            <span className="bot-action__exit">Exit</span>
          )}
        </div>
      </div>

      <div className="bot-order-row">
        <span className="bot-order-type">{bot.orderType}</span>
        <span className="bot-clock">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#8e8e93" strokeWidth="1.2"/>
            <path d="M7 4v3l2 1.5" stroke="#8e8e93" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="bot-order-tif">{bot.timeInForce}</span>
      </div>

      <div className="bot-footer">
        <div className="bot-actions">
          <button className="bot-icon-btn" title="Pause">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="3" y="2" width="2.5" height="9" rx="1" fill="#8e8e93"/>
              <rect x="7.5" y="2" width="2.5" height="9" rx="1" fill="#8e8e93"/>
            </svg>
          </button>
          <button className="bot-icon-btn" title="Edit">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9.5 2L11 3.5 4.5 10H3v-1.5L9.5 2z" stroke="#8e8e93" strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="bot-icon-btn bot-icon-btn--danger" title="Delete">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M3 4h7M5 4V3h3v1M5.5 6v4M7.5 6v4M4 4l.5 6h4l.5-6" stroke="#ff453a" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <button className="bot-preview-btn">
          <span>PREVIEW GROUP</span>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1.5" y="3" width="10" height="7.5" rx="1.5" stroke="#8e8e93" strokeWidth="1.1"/>
            <circle cx="6.5" cy="6.75" r="1.5" stroke="#8e8e93" strokeWidth="1.1"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function PositionRow({ position }) {
  const [botsOpen, setBotsOpen] = useState(false);

  return (
    <div className="position-item">
      {/* Header row */}
      <div className="position-header">
        <div className="position-header__left">
          <span className="position-ticker">{position.ticker}</span>
          <span className="position-price-badge">${position.price.toFixed(2)}</span>
          <span className="position-name">{position.name}</span>
          <span className="position-pnl-label">Open position P&amp;L:</span>
          <span className={`position-pnl-val ${position.openPnL >= 0 ? "text-green" : "text-red"}`}>
            {position.openPnL >= 0 ? "+" : ""}${Math.abs(position.openPnL).toFixed(2)}
          </span>
        </div>
        <button
          className={`position-collapse-btn ${botsOpen ? "position-collapse-btn--open" : ""}`}
          onClick={() => setBotsOpen((v) => !v)}
          title={botsOpen ? "Collapse" : "Expand"}
        >
          ‹
        </button>
      </div>

      {/* Second row */}
      <div className="position-subrow">
        <span className="position-pnl-label">Closed position P&amp;L:</span>
        <span className={`position-pnl-val ${position.closedPnL >= 0 ? "text-green" : "text-red"}`}>
          {position.closedPnL >= 0 ? "+" : "-"}${Math.abs(position.closedPnL).toFixed(2)}
        </span>
        <span className="position-divider" />
        <span className="position-pnl-label">Total position P&amp;L:</span>
        <span className={`position-pnl-val ${position.totalPnL >= 0 ? "text-green" : "text-red"}`}>
          {position.totalPnL >= 0 ? "+" : "-"}${Math.abs(position.totalPnL).toFixed(2)}
        </span>
      </div>

      {/* Legs row */}
      <div className="position-legs">
        {position.legs.map((leg, i) => (
          <div key={i} className="position-leg">
            <span className="position-leg-label">{leg.label}</span>
            <button
              className={`leg-bot-btn ${botsOpen ? "leg-bot-btn--active" : ""}`}
              onClick={() => setBotsOpen((v) => !v)}
            >
              {leg.side}
            </button>
          </div>
        ))}
      </div>

      {/* Bots panel */}
      {botsOpen && (
        <div className="bots-panel">
          {position.bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PositionsPanel() {
  return (
    <div className="positions-panel">
      <div className="positions-list">
        {mockPositions.map((pos) => (
          <PositionRow key={pos.id} position={pos} />
        ))}
      </div>
      <div className="positions-goto">
        <button className="goto-btn">
          GO TO POSITIONS
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
