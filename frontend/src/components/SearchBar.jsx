import { useState } from "react";
import { FaSearch } from "react-icons/fa";

function SearchBar({ onSearch, loading }) {
  const [company, setCompany] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!company.trim()) return;

    onSearch(company.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="search-container animate-fade-in-up">
      <input
        type="text"
        placeholder="Search any public company (e.g., Apple, Tesla, Infosys...)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="search-input"
      />
      <button type="submit" disabled={loading} className="search-btn">
        <FaSearch />
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </form>
  );
}

export default SearchBar;