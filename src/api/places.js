import { apiFetch } from "./client";

export const searchPlaces = ({
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
  apiFetch(`/api/places/${placeId}/comments`, {
    method: "POST",
    token,
    json: { text },
  });

export const deleteComment = ({ placeId, commentId, token }) =>
  apiFetch(`/api/places/${placeId}/comments/${commentId}`, {
    method: "DELETE",
    token,
  });

export const fetchPopularPlaces = async (limit = 6) => {
  const data = await apiFetch(`/api/places/popular?limit=${limit}`);
  return data.places;
};
