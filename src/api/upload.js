const BASE_URL = "http://localhost:5001";

export const uploadFiles = (files, onProgress) =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const xhr = new XMLHttpRequest();
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
    }
    xhr.onload = () => {
      if (xhr.status === 401) { reject(new Error("UNAUTHORIZED")); return; }
      if (xhr.status < 200 || xhr.status >= 300) {
        try { reject(new Error(JSON.parse(xhr.responseText).message || "Upload failed")); }
        catch { reject(new Error("Upload failed")); }
        return;
      }
      resolve(JSON.parse(xhr.responseText));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.open("POST", `${BASE_URL}/api/uploads`);
    xhr.send(formData);
  });
