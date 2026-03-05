import { apiFetch } from "./client";

export const uploadFiles = (files) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  return apiFetch("/api/uploads", { method: "POST", body: formData });
};
