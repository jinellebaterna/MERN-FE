import { useState, useRef, useEffect, useCallback } from "react";
import { COUNTRIES } from "../../data/data";
import "./country-search.css";

const CountrySearch = ({ onSelect, excludeCodes = [] }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = COUNTRIES.filter(
      (c) =>
        !excludeCodes.includes(c.code) && c.name.toLowerCase().includes(lower)
    ).slice(0, 8);
    setResults(filtered);
    setActiveIndex(-1);
  }, [query, excludeCodes]);

  const select = useCallback(
    (country) => {
      onSelect(country);
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setResults([]);
      setActiveIndex(-1);
    }, 150);
  };

  return (
    <div className="country-search">
      <input
        ref={inputRef}
        className="country-search__input"
        type="text"
        placeholder="Search for a country..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {results.length > 0 && (
        <ul ref={listRef} className="country-search__dropdown">
          {results.map((country, i) => (
            <li
              key={country.code}
              className={`country-search__item ${i === activeIndex ? "country-search__item--active" : ""}`}
              onMouseDown={() => select(country)}
            >
              <span className="country-search__flag">
                {getFlagEmoji(country.code)}
              </span>
              {country.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const getFlagEmoji = (code) =>
  code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");

// eslint-disable-next-line react-refresh/only-export-components
export { getFlagEmoji };
export default CountrySearch;
