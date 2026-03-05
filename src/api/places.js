import { apiFetch } from "./client";

export const fetchUsers = async () => {
  const data = await apiFetch("/api/users");
  return data.users;
};

export const fetchPlacesByUser = async (userId) => {
  const data = await apiFetch(`/api/places/user/${userId}`);
  return data.places;
};

export const fetchPlaceById = async (placeId) => {
  const data = await apiFetch(`/api/places/${placeId}`);
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
  return apiFetch("/api/places", { method: "POST", token, body: formData });
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
    placeData.removeImages.forEach((path) => formData.append("removeImages", path));
  }
  return apiFetch(`/api/places/${placeId}`, { method: "PATCH", token, body: formData });
};

export const deletePlace = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}`, { method: "DELETE", token });

export const searchPlaces = ({ search = "", creator = "", tag = "", page = 1, limit = 9 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (creator) params.append("creator", creator);
  if (tag) params.append("tag", tag);
  params.append("page", page);
  params.append("limit", limit);
  return apiFetch(`/api/places?${params.toString()}`);
};

export const likePlace = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}/like`, { method: "POST", token });

export const unlikePlace = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}/like`, { method: "DELETE", token });

export const markVisited = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}/visited`, { method: "POST", token });

export const unmarkVisited = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}/visited`, { method: "DELETE", token });

export const markWantToVisit = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}/want-to-visit`, { method: "POST", token });

export const unmarkWantToVisit = ({ placeId, token }) =>
  apiFetch(`/api/places/${placeId}/want-to-visit`, { method: "DELETE", token });

export const fetchComments = async (placeId) => {
  const data = await apiFetch(`/api/places/${placeId}/comments`);
  return data.comments;
};

export const addComment = ({ placeId, text, token }) =>
  apiFetch(`/api/places/${placeId}/comments`, { method: "POST", token, json: { text } });

export const deleteComment = ({ placeId, commentId, token }) =>
  apiFetch(`/api/places/${placeId}/comments/${commentId}`, { method: "DELETE", token });

export const fetchPopularPlaces = async (limit = 6) => {
  const data = await apiFetch(`/api/places/popular?limit=${limit}`);
  return data.places;
};
