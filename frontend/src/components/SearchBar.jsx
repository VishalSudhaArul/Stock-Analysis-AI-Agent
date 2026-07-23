import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  { name: "Apple Inc.", symbol: "AAPL" },
  { name: "Microsoft Corporation", symbol: "MSFT" },
  { name: "NVIDIA Corporation", symbol: "NVDA" },
  { name: "Tesla, Inc.", symbol: "TSLA" },
  { name: "Amazon.com, Inc.", symbol: "AMZN" },
  { name: "Alphabet Inc.", symbol: "GOOGL" },
  { name: "Meta Platforms, Inc.", symbol: "META" },
  { name: "Netflix, Inc.", symbol: "NFLX" },
  { name: "Infosys Limited", symbol: "INFY" },
  { name: "Tata Motors Limited", symbol: "TATAMOTORS" },
  { name: "Reliance Industries", symbol: "RELIANCE" },
  { name: "Wipro Limited", symbol: "WIPRO" },
  { name: "Tata Consultancy Services", symbol: "TCS" },
  { name: "HDFC Bank Limited", symbol: "HDFCBANK" },
  { name: "JPMorgan Chase & Co.", symbol: "JPM" },
  { name: "Taiwan Semiconductor Mfg.", symbol: "TSM" },
  { name: "Berkshire Hathaway Inc.", symbol: "BRK.A" },
];

function SearchBar({ onSearch, loading }) {
  const [company, setCompany] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  const filteredSuggestions = company.trim()
    ? SUGGESTIONS.filter(
        (item) =>
          item.name.toLowerCase().includes(company.toLowerCase()) ||
          item.symbol.toLowerCase().includes(company.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim()) return;
    onSearch(company.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (item) => {
    setCompany(item.name);
    onSearch(item.name);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "700px", margin: "0 auto 50px auto" }} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="search-container" style={{ margin: 0, width: "100%" }}>
        <input
          type="text"
          placeholder="Search any public company (e.g., Apple, Tesla, Infosys...)"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-btn">
          <span style={{ marginRight: '6px' }}>🔍</span>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="suggestions-list animate-fade-in-up">
          {filteredSuggestions.map((item) => (
            <li
              key={item.symbol}
              onClick={() => handleSuggestionClick(item)}
              className="suggestion-item"
            >
              <span>{item.name}</span>
              <span className="suggestion-symbol">{item.symbol}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;