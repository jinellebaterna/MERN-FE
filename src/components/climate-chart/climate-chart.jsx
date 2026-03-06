import { useQuery } from "@tanstack/react-query";
import { fetchMonthlyClimate } from "../../api/weather";
import "./climate-chart.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
      ? (m.tempMax.reduce((a, b) => a + b, 0) / m.tempMax.length).toFixed(1)
      : "—",
    avgLow: m.tempMin.length
      ? (m.tempMin.reduce((a, b) => a + b, 0) / m.tempMin.length).toFixed(1)
      : "—",
    precip: m.precip.length
      ? m.precip.reduce((a, b) => a + b, 0).toFixed(0)
      : "—",
  }));
};

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

  if (isLoading) return <p>Loading climate data...</p>;
  if (isError || !data) return null;

  return (
    <div className="climate-chart">
      <h4>Monthly Climate Averages</h4>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>High (°C)</th>
            <th>Low (°C)</th>
            <th>Rain (mm)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{MONTHS[i]}</td>
              <td>{row.avgHigh}</td>
              <td>{row.avgLow}</td>
              <td>{row.precip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClimateChart;
