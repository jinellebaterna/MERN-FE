import { apiFetch } from "./client";
import { uploadFiles } from "./upload";

export const loginUser = ({ email, password }) =>
  apiFetch("/api/users/login", { method: "POST", json: { email, password } });

export const signupUser = async ({ name, email, password, image }) => {
  let imagePath = null;
  if (image) {
    const { paths } = await uploadFiles([image]);
    imagePath = paths[0];
  }
  return apiFetch("/api/users/signup", {
    method: "POST",
    json: { name, email, password, image: imagePath },
  });
};
