import { useState, useEffect } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
import Candle from "./simple-chart";

const NIFTY50 = [
  "ADANIENT",
  "ADANIPORTS",
  "APOLLOHOSP",
  "ASIANPAINT",
  "AXISBANK",
  "BAJAJ-AUTO",
  "BAJFINANCE",
  "BAJAJFINSV",
  "BPCL",
  "BHARTIARTL",
  "BRITANNIA",
  "CIPLA",
  "COALINDIA",
  "DIVISLAB",
  "DRREDDY",
  "EICHERMOT",
  "GRASIM",
  "HCLTECH",
  "HDFCBANK",
  "HDFCLIFE",
  "HEROMOTOCO",
  "HINDALCO",
  "HINDUNILVR",
  "ICICIBANK",
  "ITC",
  "INDUSINDBK",
  "INFY",
  "JSWSTEEL",
  "KOTAKBANK",
  "LT",
  "M&M",
  "MARUTI",
  "NTPC",
  "NESTLEIND",
  "ONGC",
  "POWERGRID",
  "RELIANCE",
  "SBILIFE",
  "SBIN",
  "SUNPHARMA",
  "TCS",
  "TATACONSUM",
  "TATAMOTORS",
  "TATASTEEL",
  "TECHM",
  "TITAN",
  "ULTRACEMCO",
  "UPL",
  "WIPRO",
];

export default function App() {
  const [query, setQuery] = useState("TATAMOTORS"); // default symbol
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refresh,setRefresh]=useState(0)
  // const [chartType, setChartType] = useState("candlestick");

  useEffect(() => {
    if (!query) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://127.0.0.1:8000/ticker/${query}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        setData(json.ohlc); // array of {date, open, high, low, close, volume}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [query,refresh]);

  return (
    <>
    <Logo/>
      <NavBar>
        {/* <Search query={query} setQuery={setQuery} /> */}
        <NumResults query={query} setQuery={setQuery} >
        <div className="flex">
        <div>
          <p style={{color:"white",fontSize:'1.5rem',paddingBottom:"5px"}}>Stock:</p>
    <select
      className="select"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    >
      {NIFTY50.map((stock) => (
        <option value={stock} key={stock}>
          {stock}
        </option>
      ))}
    </select>
    </div>
        </div></NumResults>
    <NumResults>
     <div style={{display:'flex',alignItem:'center'}}>
     <button className="search" onClick={()=>setRefresh(r=>r+1)}>Refresh Data</button>
     </div>
    </NumResults>
      </NavBar>

      <Main>
        <Box
          style={{
            padding: "20px",
            backgroundColor: "#1e1e2f",
            borderRadius: "12px",
            minHeight: "600px",
          }}
        >
          {loading && <Loader />}
          {error && <Error message={error} />}
          {!loading &&
          !error &&
          data.length > 0 &&
            <Candle query={query} />
          }
        {/* <ToggleType setChartType={setChartType} /> */}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function Error({ message }) {
  return (
    <p className="error">
      <span>💥</span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav  className="nav-bar">
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
    <div className="flex">
      <h1>NSE Stock Dashboard</h1>
      </div>
      <div style={{fontSize:'17px',color:'white',paddingBottom:"5px"}}><p>Professional Trading Analysis</p></div>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search charts..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({children}){
  return( <div>
      {children}
  </div> )
}

function ToggleType({ setChartType }) {
  return (
    <div className="chart-type-toggle">
      <button onClick={() => setChartType("candlestick")}>Candles</button>
      <button onClick={() => setChartType("line")}>Line</button>
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

// function NumResults({ query, setQuery }) {
//   return (
//     <div style={{display:'flex',gap:'10px'}}>
//     <div>
//     <p style={{color:"white",fontSize:'1.5rem',paddingBottom:"5px"}}>Stock:</p>
//     <select
//       className="select"
//       value={query}
//       onChange={(e) => setQuery(e.target.value)}
//     >
//       {NIFTY50.map((stock) => (
//         <option value={stock} key={stock}>
//           {stock}
//         </option>
//       ))}
//     </select>
//     </div>
//     <div>
//     <p style={{color:"white",fontSize:'1.5rem',paddingBottom:"5px"}}>Strike Price</p>
//     <input type="text" className="search"/>
//     </div>
//     <div style={{display:'flex',alignItem:'center'}}>
//     <button className="search">Refresh Data</button>
//     </div>
//     </div> 
//   );
// }