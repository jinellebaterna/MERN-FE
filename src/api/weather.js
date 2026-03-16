import { MONTHS, IMG_BASE } from "../data/data";

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

export const fetchVisaRequirement = async (passportName, destName) => {
  const res = await fetch(
    `${IMG_BASE}/api/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(destName)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.requirement ?? null;
};

export const fetchCountryInfo = async (code) => {
  const res = await fetch(
    `https://restcountries.com/v3.1/alpha/${code}?fields=currencies,languages`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const currencyEntry = Object.entries(data.currencies || {})[0];
  const currencyCode = currencyEntry?.[0] || null;
  const currency = currencyEntry?.[1]?.symbol || null;
  const language = Object.values(data.languages || {})[0] || null;
  return { currency, currencyCode, language };
};

export const fetchExchangeRate = async (fromCode, toCode) => {
  if (!fromCode || !toCode || fromCode === toCode) return 1;
  const res = await fetch(`https://open.er-api.com/v6/latest/${fromCode}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.rates?.[toCode] ?? null;
};

export const getBestMonths = (dailyData) => {
  if (!dailyData?.time) return null;
  const monthly = Array.from({ length: 12 }, () => ({ temps: [], precip: 0 }));
  dailyData.time.forEach((date, i) => {
    const m = new Date(date).getMonth();
    const avg =
      (dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2;
    monthly[m].temps.push(avg);
    monthly[m].precip += dailyData.precipitation_sum[i] || 0;
  });
  const good = monthly
    .map((m, i) => {
      const avgTemp =
        m.temps.reduce((s, t) => s + t, 0) / (m.temps.length || 1);
      return { i, avgTemp, precip: m.precip };
    })
    .filter(
      ({ avgTemp, precip }) => avgTemp >= 10 && avgTemp <= 28 && precip < 100
    )
    .map(({ i }) => i);
  if (!good.length) return null;
  const first = MONTHS[good[0]];
  const last = MONTHS[good[good.length - 1]];
  return first === last ? first : `${first}–${last}`;
};

export const groupByMonth = (daily) => {
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
