export const updatePlace = async ({ placeId, placeData, token }) => {
  const response = await fetch(`http://localhost:5001/api/places/${placeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(placeData),
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update place");
  }

  return response.json();
};

export const fetchPlaceById = async (placeId) => {
  const response = await fetch(`http://localhost:5001/api/places/${placeId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch place");
  }

  const data = await response.json();
  return data.place;
};
