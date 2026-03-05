import { apiFetch } from "./client";
import { uploadFiles } from "./upload";

export const loginUser = ({ email, password }) =>
  apiFetch("/api/users/login", { method: "POST", json: { email, password } });

export const signupUser = async ({ name, email, password, image }) => {
  const { paths } = await uploadFiles([image]);
  return apiFetch("/api/users/signup", {
    method: "POST",
    json: { name, email, password, image: paths[0] },
  });
};
