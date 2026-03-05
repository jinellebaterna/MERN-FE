import { useState, useRef, useCallback } from "react";
import { uploadFiles } from "../../../api/upload";

const fileKey = (f) => `${f.name}-${f.size}`;

export const useImageUpload = (onInputCallback) => {
  const pathMapRef = useRef(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const imageInputHandler = useCallback(
    async (id, files, _isValid) => {
      // Sync removals
      const currentKeys = new Set(files.map(fileKey));
      for (const k of pathMapRef.current.keys()) {
        if (!currentKeys.has(k)) pathMapRef.current.delete(k);
      }

      const newFiles = files.filter((f) => !pathMapRef.current.has(fileKey(f)));

      const emitPaths = () => {
        const paths = files.map((f) => pathMapRef.current.get(fileKey(f))).filter(Boolean);
        onInputCallback(id, paths, paths.length > 0);
      };

      if (!newFiles.length) {
        emitPaths();
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      try {
        const { paths } = await uploadFiles(newFiles);
        newFiles.forEach((f, i) => pathMapRef.current.set(fileKey(f), paths[i]));
        emitPaths();
      } catch (err) {
        setUploadError(err.message || "Upload failed. Please try again.");
        emitPaths();
      } finally {
        setIsUploading(false);
      }
    },
    [onInputCallback]
  );

  const clearUploadError = useCallback(() => setUploadError(null), []);

  return { imageInputHandler, isUploading, uploadError, clearUploadError };
};
