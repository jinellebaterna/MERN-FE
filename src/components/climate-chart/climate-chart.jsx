import { useQuery } from "@tanstack/react-query";
import { fetchMonthlyClimate } from "../../api/weather";
import { MONTHS } from "../../data/data";
import "./climate-chart.css";

const groupByMonth = (daily) => {
  const months = Array.from({ length: 12 }, () => ({
    tempMax: [],
    tempMin: [],
    precip: [],
  }));

  daily.time.forEach((dateStr, i) => {
    const month = new Date(dateStr).getMonth();
    if (daily.temperature_2m_max[i] != null)
      months[month].tempMax.push(daily.temperature_2m_max[i]);
    if (daily.temperature_2m_min[i] != null)
      months[month].tempMin.push(daily.temperature_2m_min[i]);
    if (daily.precipitation_sum[i] != null)
      months[month].precip.push(daily.precipitation_sum[i]);
  });

  return months.map((m) => ({
    avgHigh: m.tempMax.length
      ? m.tempMax.reduce((a, b) => a + b, 0) / m.tempMax.length
      : null,
    avgLow: m.tempMin.length
      ? m.tempMin.reduce((a, b) => a + b, 0) / m.tempMin.length
      : null,
    precip: m.precip.length ? m.precip.reduce((a, b) => a + b, 0) : null,
  }));
};

const SKELETON_HEIGHTS = [60, 45, 70, 55, 80, 65, 50, 75, 60, 45, 70, 55];

const ClimateChart = ({ lat, lon }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["climate", lat, lon],
    queryFn: async () => {
      const daily = await fetchMonthlyClimate(lat, lon);
      return groupByMonth(daily);
    },
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 60 * 24,
  });

  if (isLoading)
    return (
      <div className="climate-chart">
        <h4>Monthly Climate</h4>
        <div className="climate-chart__bars climate-chart__skeleton">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="climate-chart__month">
              <div className="climate-chart__temp-col">
                <div className="climate-chart__temp-track">
                  <div
                    className="climate-chart__skel-bar"
                    style={{ height: `${SKELETON_HEIGHTS[i]}%` }}
                  />
                </div>
              </div>
              <div className="climate-chart__precip-col">
                <div className="climate-chart__precip-track">
                  <div
                    className="climate-chart__skel-bar"
                    style={{ height: `${SKELETON_HEIGHTS[11 - i]}%` }}
                  />
                </div>
              </div>
              <span className="climate-chart__month-label">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    );

  if (isError || !data) return null;
  const validTemps = data.filter(
    (d) => d.avgHigh !== null && d.avgLow !== null
  );
  const allHighs = validTemps.map((d) => d.avgHigh);
  const allLows = validTemps.map((d) => d.avgLow);
  const tempMin = Math.min(...allLows);
  const tempMax = Math.max(...allHighs);
  const tempRange = tempMax - tempMin || 1;

  const maxPrecip = Math.max(...data.map((d) => d.precip ?? 0), 1);

  return (
    <div className="climate-chart climate-chart--loaded">
      <h4>Monthly Climate</h4>
      <div className="climate-chart__bars">
        {data.map((row, i) => {
          const hasTemp = row.avgHigh !== null && row.avgLow !== null;
          const lowPct = hasTemp
            ? ((row.avgLow - tempMin) / tempRange) * 100
            : 0;
          const highPct = hasTemp
            ? ((row.avgHigh - tempMin) / tempRange) * 100
            : 0;
          const rangePct = highPct - lowPct;
          const precipPct =
            row.precip !== null ? (row.precip / maxPrecip) * 100 : 0;

          return (
            <div key={i} className="climate-chart__month">
              <div className="climate-chart__temp-col">
                {hasTemp && (
                  <span className="climate-chart__temp-label climate-chart__temp-label--high">
                    {row.avgHigh.toFixed(0)}°
                  </span>
                )}
                <div className="climate-chart__temp-track">
                  <div
                    className="climate-chart__temp-bar"
                    style={{ bottom: `${lowPct}%`, height: `${rangePct}%` }}
                  />
                </div>
                {hasTemp && (
                  <span className="climate-chart__temp-label climate-chart__temp-label--low">
                    {row.avgLow.toFixed(0)}°
                  </span>
                )}
              </div>
              <div className="climate-chart__precip-col">
                <div className="climate-chart__precip-track">
                  <div
                    className="climate-chart__precip-bar"
                    style={{ height: `${precipPct}%` }}
                  />
                </div>
                {row.precip !== null && (
                  <span className="climate-chart__precip-label">
                    {Math.round(row.precip)}
                  </span>
                )}
              </div>
              <span className="climate-chart__month-label">{MONTHS[i]}</span>
            </div>
          );
        })}
      </div>
      <div className="climate-chart__legend">
        <span className="climate-chart__legend-temp">⬜ Temp range (°C)</span>
        <span className="climate-chart__legend-precip">🟦 Rain (mm)</span>
      </div>
    </div>
  );
};

export default ClimateChart;
