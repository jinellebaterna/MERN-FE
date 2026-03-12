const CountryCities = ({
  country,
  canEdit,
  cityInput,
  setCityInput,
  citySuggestions,
  cityActiveIndex,
  setCityActiveIndex,
  onCitiesChange,
}) => {
  const filteredSuggestions = citySuggestions
    .filter(
      (c) =>
        c.toLowerCase().includes(cityInput.toLowerCase()) &&
        !(country.cities || []).includes(c)
    )
    .slice(0, 8);

  return (
    <div className="country-modal__cities">
      <h4>Cities Visited</h4>
      <div className="country-modal__city-tags">
        {(country.cities || []).map((city) => (
          <span key={city} className="city-tag">
            {city}
            {canEdit && (
              <button
                onClick={() => {
                  const updated = country.cities.filter((c) => c !== city);
                  onCitiesChange(updated);
                }}
              >
                &times;
              </button>
            )}
          </span>
        ))}
      </div>
      {canEdit && (
        <div className="country-modal__city-input">
          <input
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setCityActiveIndex(-1);
            }}
            placeholder="Add a city..."
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCityActiveIndex((i) =>
                  Math.min(i + 1, filteredSuggestions.length - 1)
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCityActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Escape") {
                setCityActiveIndex(-1);
                setCityInput("");
              } else if (e.key === "Enter" && cityInput.trim()) {
                e.preventDefault();
                const toAdd =
                  cityActiveIndex >= 0 && filteredSuggestions[cityActiveIndex]
                    ? filteredSuggestions[cityActiveIndex]
                    : cityInput.trim();
                onCitiesChange([...(country.cities || []), toAdd]);
                setCityInput("");
                setCityActiveIndex(-1);
              }
            }}
          />
          {cityInput.trim() && filteredSuggestions.length > 0 && (
            <ul className="country-modal__city-dropdown">
              {filteredSuggestions.map((city, i) => (
                <li
                  key={city}
                  className={`country-modal__city-option${i === cityActiveIndex ? " country-modal__city-option--active" : ""}`}
                  onMouseDown={() => {
                    onCitiesChange([...(country.cities || []), city]);
                    setCityInput("");
                    setCityActiveIndex(-1);
                  }}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CountryCities;
