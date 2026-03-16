import { useState, useRef, useEffect } from "react";

const TRADE_MENU = [
  {
    id: "option-chains",
    label: "OPTION CHAINS",
    external: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M10.5 13.5h6M13.5 10.5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "simulate",
    label: "SIMULATE",
    external: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 14L6 9l3 3 4-5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: "entry-bot",
    label: "ENTRY BOT",
    external: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="9" cy="9" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "trade-ideas",
    label: "TRADE IDEAS",
    external: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2a5 5 0 014 8c.5.8.5 1.5.5 2H4.5c0-.5 0-1.2.5-2A5 5 0 019 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M6.5 12v1a2.5 2.5 0 005 0v-1" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 2V1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="14" cy="5" r="1" fill="currentColor" opacity="0.5"/>
        <circle cx="4" cy="5" r="1" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "trade-settings",
    label: "TRADE SETTINGS",
    external: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.42 1.42M12.88 12.88l1.42 1.42M3.7 14.3l1.42-1.42M12.88 5.12l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const NAV_ITEMS = [
  {
    id: "quotes",
    label: "MARKET VIEW",
    sub: "QUOTES",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: "positions",
    label: "POSITIONS",
    sub: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1.5" y="6.75" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1.5" y="11.5" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: "trade",
    label: "TRADE",
    sub: null,
    dropdown: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "chart",
    label: "CHART",
    sub: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.5 12.5L5 8l3 2.5L11 5.5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "account",
    label: "ACCOUNT SUMMARY",
    sub: null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function TradeDropdown({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.closest(".nav-item-wrap").contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="trade-dropdown" ref={ref}>
      {TRADE_MENU.map((item) => (
        <button key={item.id} className="trade-dropdown__item">
          <span className="trade-dropdown__icon">{item.icon}</span>
          <span className="trade-dropdown__label">{item.label}</span>
          {item.external && (
            <svg className="trade-dropdown__ext" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M8 1h3m0 0v3m0-3L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [active, setActive] = useState("quotes");
  const [tradeOpen, setTradeOpen] = useState(false);

  function handleNavClick(item) {
    if (item.dropdown) {
      setTradeOpen((v) => !v);
    } else {
      setActive(item.id);
      setTradeOpen(false);
    }
  }

  return (
    <nav className="navbar">
      {/* Left: broker selector */}
      <div className="navbar__left">
        <div className="broker-widget">
          {/* Connect broker icon */}
          <button className="broker-widget__btn" title="Connect broker">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="8" cy="7" r="3" stroke="#e05c5c" strokeWidth="1.4"/>
              <circle cx="15" cy="7" r="3" stroke="#e05c5c" strokeWidth="1.4"/>
              <path d="M2 18c0-3 2.5-5 6-5h1" stroke="#e05c5c" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M13 16h6M16 13l3 3-3 3" stroke="#e05c5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Divider */}
          <div className="broker-widget__divider" />

          {/* Paper trading mode icon */}
          <button className="broker-widget__mode" title="Paper trading mode">
            <div className="broker-mode-circle">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 13L8 3l5 10" stroke="url(#arrowGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="arrowGrad" x1="3" y1="13" x2="13" y2="3" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff6b35"/>
                    <stop offset="1" stopColor="#ffd60a"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="broker-widget__label">Trading with<br/>paper money</span>
          </button>
        </div>
      </div>

      {/* Center: nav items */}
      <div className="navbar__center">
        {NAV_ITEMS.map((item) => (
          <div key={item.id} className="nav-item-wrap">
            <button
              className={`nav-item ${active === item.id || (item.dropdown && tradeOpen) ? "nav-item--active" : ""}`}
              onClick={() => handleNavClick(item)}
            >
              <span className="nav-item__icon">{item.icon}</span>
              <span className="nav-item__labels">
                <span className="nav-item__label">{item.label}</span>
                {item.sub && <span className="nav-item__sub">{item.sub}</span>}
              </span>
            </button>
            {item.dropdown && tradeOpen && (
              <TradeDropdown onClose={() => setTradeOpen(false)} />
            )}
          </div>
        ))}
      </div>

      {/* Right: actions */}
      <div className="navbar__right">
        <button className="nav-icon-btn" title="Settings">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8.5 1.5v1.8M8.5 13.7v1.8M1.5 8.5h1.8M13.7 8.5h1.8M3.6 3.6l1.27 1.27M12.13 12.13l1.27 1.27M3.6 13.4l1.27-1.27M12.13 4.87l1.27-1.27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>

        <button className="nav-icon-btn nav-icon-btn--upgrade" title="Upgrade">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="8.5" r="7" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8.5 5l1.2 2.4L12.5 8l-2 1.95.47 2.75L8.5 11.4l-2.47 1.3.47-2.75L4.5 8l2.8-.6L8.5 5z" fill="currentColor"/>
          </svg>
        </button>

        <div className="nav-notif-wrap">
          <button className="nav-icon-btn" title="Notifications">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M8.5 1.5C6 1.5 4 3.5 4 6v3.5L2.5 11h12L13 9.5V6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M7 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
          <span className="nav-badge">10</span>
        </div>

        <button className="nav-icon-btn nav-theme-btn" title="Toggle theme">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8.5 1v1.5M8.5 14.5V16M1 8.5h1.5M14.5 8.5H16M3.1 3.1l1.06 1.06M12.84 12.84l1.06 1.06M3.1 13.9l1.06-1.06M12.84 4.16l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>

        <button className="nav-logout-btn">
          <span>LOGOUT</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 7H2M12 7l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 4.5V3a1 1 0 011-1h5a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
