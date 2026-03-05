import { apiFetch } from "./client";
import { uploadFiles } from "./upload";

export const fetchUserById = async (userId) => {
  const data = await apiFetch(`/api/users/${userId}`);
  return data.user;
};

export const updateUser = async ({ userId, userData, token }) => {
  let imagePath;
  if (userData.image) {
    const { paths } = await uploadFiles([userData.image]);
    imagePath = paths[0];
  }
  return apiFetch(`/api/users/${userId}`, {
    method: "PATCH",
    token,
    json: { name: userData.name, ...(imagePath && { image: imagePath }) },
  });
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
