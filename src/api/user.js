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

export const changePassword = ({
  userId,
  currentPassword,
  newPassword,
  token,
}) =>
  apiFetch(`/api/users/${userId}/password`, {
    method: "PATCH",
    token,
    json: { currentPassword, newPassword },
  });

export const deleteUser = ({ userId, token }) =>
  apiFetch(`/api/users/${userId}`, { method: "DELETE", token });

export const fetchUserCountries = (userId) =>
  apiFetch(`/api/users/${userId}/countries`).then((d) => d.countries);

export const addUserCountry = ({ userId, name, code, token }) =>
  apiFetch(`/api/users/${userId}/countries`, {
    method: "POST",
    token,
    json: { name, code },
  });

export const removeUserCountry = ({ userId, code, token }) =>
  apiFetch(`/api/users/${userId}/countries/${code}`, {
    method: "DELETE",
    token,
  });

export const updateCountryImages = ({
  userId,
  code,
  addImages,
  removeImages,
  token,
}) =>
  apiFetch(`/api/users/${userId}/countries/${code}/images`, {
    method: "PATCH",
    token,
    json: { addImages, removeImages },
  });

export const updateCountry = ({
  userId,
  code,
  story,
  cities,
  ratings,
  token,
}) =>
  apiFetch(`/api/users/${userId}/countries/${code}`, {
    method: "PATCH",
    token,
    json: { story, cities, ratings },
  });

export const fetchUserWishlist = (userId) =>
  apiFetch(`/api/users/${userId}/wishlist`).then((d) => d.wishlist);

export const addToWishlist = ({ userId, name, code, token }) =>
  apiFetch(`/api/users/${userId}/wishlist`, {
    method: "POST",
    token,
    json: { name, code },
  });

export const removeFromWishlist = ({ userId, code, token }) =>
  apiFetch(`/api/users/${userId}/wishlist/${code}`, {
    method: "DELETE",
    token,
  });

export const fetchAllUsers = () => apiFetch("/api/users").then((d) => d.users);

export const followUser = ({ userId, token }) =>
  apiFetch(`/api/users/${userId}/follow`, { method: "POST", token });

export const unfollowUser = ({ userId, token }) =>
  apiFetch(`/api/users/${userId}/follow`, { method: "DELETE", token });

export const toggleLikeCountry = ({ userId, code, token }) =>
  apiFetch(`/api/users/${userId}/countries/${code}/like`, {
    method: "POST",
    token,
  });

export const addCountryComment = ({ userId, code, text, token }) =>
  apiFetch(`/api/users/${userId}/countries/${code}/comments`, {
    method: "POST",
    token,
    json: { text },
  });

export const deleteCountryComment = ({ userId, code, commentId, token }) =>
  apiFetch(`/api/users/${userId}/countries/${code}/comments/${commentId}`, {
    method: "DELETE",
    token,
  });

export const reorderCountries = ({ userId, codes, token }) =>
  apiFetch(`/api/users/${userId}/countries/reorder`, {
    method: "PATCH",
    token,
    json: { codes },
  });

export const reorderWishlist = ({ userId, codes, token }) =>
  apiFetch(`/api/users/${userId}/wishlist/reorder`, {
    method: "PATCH",
    token,
    json: { codes },
  });

export const updateWishlistDetails = ({
  userId,
  code,
  notes,
  priority,
  targetYear,
  token,
}) =>
  apiFetch(`/api/users/${userId}/wishlist/${code}/details`, {
    method: "PATCH",
    token,
    json: { notes, priority, targetYear },
  });
