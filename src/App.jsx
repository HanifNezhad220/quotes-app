import { useState } from "react";
import Navbar from "./Navbar";
import StockList from "./StockList";
import StockChart from "./StockChart";
import { stocks as initialStocks, createMockStock } from "./data";
import "./App.css";

export default function App() {
  const [stocks, setStocks] = useState(initialStocks);
  const [selected, setSelected] = useState(initialStocks[0]);

  function handleAdd(ticker) {
    const upper = ticker.toUpperCase().trim();
    if (!upper || stocks.find((s) => s.ticker === upper)) return;
    const newStock = createMockStock(upper);
    setStocks((prev) => [...prev, newStock]);
    setSelected(newStock);
  }

  function handleRemove(ticker) {
    setStocks((prev) => {
      const next = prev.filter((s) => s.ticker !== ticker);
      if (selected?.ticker === ticker) {
        setSelected(next[0] ?? null);
      }
      return next;
    });
  }

  function handleReorder(fromIndex, toIndex) {
    setStocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  return (
    <div className="app">
      <Navbar />
      <div className="app__body">
        <StockList
          stocks={stocks}
          selected={selected}
          onSelect={setSelected}
          onRemove={handleRemove}
          onAdd={handleAdd}
          onReorder={handleReorder}
        />
        <StockChart stock={selected} />
      </div>
    </div>
  );
}
