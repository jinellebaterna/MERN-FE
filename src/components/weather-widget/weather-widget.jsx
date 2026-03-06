import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../../api/weather";

const WMO_CODES = {
  0: "Clear sky ☀️ ",
  1: "Mainly clear 🌤️ ",
  2: "Partly cloudy ⛅",
  3: "Overcast ☁️ ",
  45: "Fog 🌫️ ",
  48: "Fog 🌫️ ",
  51: "Light drizzle 🌦️ ",
  53: "Drizzle 🌦️ ",
  55: "Heavy drizzle 🌦️ ",
  61: "Light rain 🌧️ ",
  63: "Rain 🌧️ ",
  65: "Heavy rain 🌧️ ",
  71: "Light snow ❄️ ",
  73: "Snow ❄️ ",
  75: "Heavy snow ❄️ ",
  80: "Showers 🌦️ ",
  81: "Showers 🌦️ ",
  82: "Heavy showers 🌦️ ",
  95: "Thunderstorm ⛈️ ",
};

const WeatherWidget = ({ lat, lon }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather", lat, lon],
    queryFn: () => fetchWeather(lat, lon),
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return <p>Loading weather...</p>;
  if (isError || !data) return <p>Weather unavailable</p>;

  return (
    <div className="weather-widget">
      <h4>Current Weather</h4>
      <p>{WMO_CODES[data.weather_code] ?? "Unknown"}</p>
      <p>🌡️ {data.temperature_2m}°C</p>
      <p>💨 {data.wind_speed_10m} km/h</p>
      <p>💧 {data.relative_humidity_2m}%</p>
    </div>
  );
};

export default WeatherWidget;
