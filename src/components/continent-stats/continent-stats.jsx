import COUNTRIES from "../../data/countries";
import "./continent-stats.css";

const CONTINENT_ORDER = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

const ContinentStats = ({ countries }) => {
  const totals = COUNTRIES.reduce((acc, c) => {
    acc[c.continent] = (acc[c.continent] || 0) + 1;
    return acc;
  }, {});

  const visited = countries.reduce((acc, c) => {
    const found = COUNTRIES.find((a) => a.code === c.code);
    if (found) acc[found.continent] = (acc[found.continent] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="continent-stats">
      {CONTINENT_ORDER.map((continent) => {
        const total = totals[continent] || 0;
        const count = visited[continent] || 0;
        const pct = total ? (count / total) * 100 : 0;

        return (
          <div key={continent} className="continent-stats__card">
            <div className="continent-stats__name">{continent}</div>
            <div className="continent-stats__count">
              {count} / {total} countries
            </div>
            <div className="continent-stats__bar-track">
              <div
                className="continent-stats__bar"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContinentStats;
