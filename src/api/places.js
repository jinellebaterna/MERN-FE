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

  if (placeData.images?.length) {
    placeData.images.forEach((img) => formData.append("images", img));
  }
  if (placeData.tags?.length) {
    placeData.tags.forEach((t) => formData.append("tags", t));
  }

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
  const formData = new FormData();
  formData.append("title", placeData.title);
  formData.append("description", placeData.description);
  if (placeData.tags?.length) {
    placeData.tags.forEach((t) => formData.append("tags", t));
  }

  if (placeData.newImages?.length) {
    placeData.newImages.forEach((img) => formData.append("images", img));
  }

  if (placeData.removeImages?.length) {
    placeData.removeImages.forEach((path) =>
      formData.append("removeImages", path)
    );
  }

  const response = await fetch(`http://localhost:5001/api/places/${placeId}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token }, // no Content-Type — let browser set it for FormData
    body: formData,
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

export const searchPlaces = async ({
  search = "",
  creator = "",
  tag = "",
  page = 1,
  limit = 9,
} = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (creator) params.append("creator", creator);
  if (tag) params.append("tag", tag);
  params.append("page", page);
  params.append("limit", limit);

  const response = await fetch(
    `http://localhost:5001/api/places?${params.toString()}`
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Search failed");
  }

  return response.json();
};

export const likePlace = async ({ placeId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/like`,
    { method: "POST", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to like place");
  }
  return response.json();
};

export const unlikePlace = async ({ placeId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/like`,
    { method: "DELETE", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to unlike place");
  }
  return response.json();
};

export const markVisited = async ({ placeId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/visited`,
    { method: "POST", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to mark visited");
  }
  return response.json();
};

export const unmarkVisited = async ({ placeId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/visited`,
    { method: "DELETE", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to unmark visited");
  }
  return response.json();
};

export const markWantToVisit = async ({ placeId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/want-to-visit`,
    { method: "POST", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to mark want-to-visit");
  }
  return response.json();
};

export const unmarkWantToVisit = async ({ placeId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/want-to-visit`,
    { method: "DELETE", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to unmark want-to-visit");
  }
  return response.json();
};

export const fetchComments = async (placeId) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/comments`
  );
  if (!response.ok) throw new Error("Failed to fetch comments");
  const data = await response.json();
  return data.comments;
};

export const addComment = async ({ placeId, text, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ text }),
    }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to add comment");
  }
  return response.json();
};

export const deleteComment = async ({ placeId, commentId, token }) => {
  const response = await fetch(
    `http://localhost:5001/api/places/${placeId}/comments/${commentId}`,
    { method: "DELETE", headers: { Authorization: "Bearer " + token } }
  );
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete comment");
  }
  return response.json();
};

export const fetchPopularPlaces = async (limit = 6) => {
  const response = await fetch(
    `http://localhost:5001/api/places/popular?limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to fetch popular places");
  const data = await response.json();
  return data.places;
};
