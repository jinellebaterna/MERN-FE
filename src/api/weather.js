export const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();

  if (!data.length) throw new Error("Location not found");
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    country: data[0].address?.country || null,
  };
};

export const fetchWeather = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
  const res = await fetch(url);

  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  return data.current;
};

export const fetchMonthlyClimate = async (lat, lon) => {
  const year = new Date().getFullYear() - 1; // last full year
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Climate fetch failed");
  const data = await res.json();
  return data.daily;
};
