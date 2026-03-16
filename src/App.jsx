import { useState } from "react";
import Navbar from "./Navbar";
import StockList from "./StockList";
import StockChart from "./StockChart";
import { stocks } from "./data";
import "./App.css";

export default function App() {
  const [selected, setSelected] = useState(stocks[0]);

  return (
    <div className="app">
      <Navbar />
      <div className="app__body">
        <StockList stocks={stocks} selected={selected} onSelect={setSelected} />
        <StockChart stock={selected} />
      </div>
    </div>
  );
}
