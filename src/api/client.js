const BASE_URL = "http://localhost:5001";

export const apiFetch = async (path, { method = "GET", body, token, json } = {}) => {
  const headers = {};
  if (token) headers.Authorization = "Bearer " + token;
  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body });
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Request failed");
  }
  return response.json();
};
