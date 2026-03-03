// src/api/places.js
export const fetchUsers = async () => {
  const response = await fetch("http://localhost:5001/api/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await response.json();
  return data.users;
};

export const fetchPlacesByUser = async (userId) => {
  const response = await fetch(
    `http://localhost:5001/api/places/user/${userId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch places");
  }
  const data = await response.json();
  return data.places;
};

export const fetchPlaceById = async (placeId) => {
  const response = await fetch(`http://localhost:5001/api/places/${placeId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch place");
  }

  const data = await response.json();
  return data.place;
};

export const createPlace = async ({ placeData, token }) => {
  const formData = new FormData();
  formData.append("title", placeData.title);
  formData.append("description", placeData.description);
  formData.append("address", placeData.address);
  formData.append("creator", placeData.creator);
  formData.append("image", placeData.image);

  const response = await fetch("http://localhost:5001/api/places", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to create place");
  }

  return response.json();
};

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

export const deletePlace = async ({ placeId, token }) => {
  const response = await fetch(`http://localhost:5001/api/places/${placeId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete place");
  }

  return response.json();
};