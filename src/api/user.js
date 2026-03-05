import { apiFetch } from "./client";

export const fetchUserById = async (userId) => {
  const data = await apiFetch(`/api/users/${userId}`);
  return data.user;
};

export const updateUser = async ({ userId, userData, token }) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  if (userData.image) formData.append("image", userData.image);
  return apiFetch(`/api/users/${userId}`, { method: "PATCH", token, body: formData });
};

export const fetchLikedPlaces = async (userId) => {
  const data = await apiFetch(`/api/users/${userId}/liked-places`);
  return data.places;
};

export const changePassword = ({ userId, currentPassword, newPassword, token }) =>
  apiFetch(`/api/users/${userId}/password`, {
    method: "PATCH",
    token,
    json: { currentPassword, newPassword },
  });

export const deleteUser = ({ userId, token }) =>
  apiFetch(`/api/users/${userId}`, { method: "DELETE", token });
