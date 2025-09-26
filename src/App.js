import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [query, setQuery] = useState("TATAMOTORS"); // default symbol
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (query.length < 3) {
      setError(null);
      setData([]);
      return;
    }
    fetchData();
  }, [query]); // refetch whenever query changes

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults />
      </NavBar>

      <Main>
        <Box>
          {loading && <Loader />}
          {error && <Error message={error} />}

          {!loading && !error && data.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <XAxis dataKey="date" hide /> {/* hide if too many dates */}
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#6741d9"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">📈</span>
      <h1>NSE Stock Dashboard</h1>
      <span role="img">📉</span>
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

function NumResults() {
  return <p className="num-results">💵💹</p>;
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
