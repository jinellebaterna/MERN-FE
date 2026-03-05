import { apiFetch } from "./client";

export const loginUser = ({ email, password }) =>
  apiFetch("/api/users/login", { method: "POST", json: { email, password } });

export const signupUser = ({ name, email, password, image }) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("name", name);
  formData.append("password", password);
  formData.append("image", image);
  return apiFetch("/api/users/signup", { method: "POST", body: formData });
};
