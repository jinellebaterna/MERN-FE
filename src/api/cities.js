const cache = {};

export const fetchCitiesForCountry = async (countryName) => {
  if (cache[countryName]) return cache[countryName];
  try {
    const res = await fetch(
      "https://countriesnow.space/api/v0.1/countries/cities",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryName }),
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const cities = json.error ? [] : json.data || [];
    cache[countryName] = cities;
    return cities;
  } catch {
    return [];
  }
};
