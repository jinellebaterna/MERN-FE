import { useState, useRef, useCallback } from "react";
import { uploadFiles } from "../../../api/upload";

const fileKey = (f) => `${f.name}-${f.size}`;

export const useImageUpload = (onInputCallback) => {
  const pathMapRef = useRef(new Map());
  const uploadProgressMapRef = useRef(new Map());
  const uploadIdRef = useRef(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingKeys, setUploadingKeys] = useState(new Set());
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const imageInputHandler = useCallback(
    async (id, files, _isValid) => {
      // Sync removals
      const currentKeys = new Set(files.map(fileKey));
      for (const k of pathMapRef.current.keys()) {
        if (!currentKeys.has(k)) pathMapRef.current.delete(k);
      }
      setUploadingKeys(prev => {
        const next = new Set(prev);
        for (const k of next) if (!currentKeys.has(k)) next.delete(k);
        return next;
      });

      const newFiles = files.filter((f) => !pathMapRef.current.has(fileKey(f)));

      const emitPaths = () => {
        const paths = files.map((f) => pathMapRef.current.get(fileKey(f))).filter(Boolean);
        onInputCallback(id, paths, paths.length > 0);
      };

      if (!newFiles.length) {
        emitPaths();
        return;
      }

      const recompute = () => {
        const map = uploadProgressMapRef.current;
        if (map.size === 0) {
          setUploadProgress(null);
        } else {
          const avg = [...map.values()].reduce((a, b) => a + b, 0) / map.size;
          setUploadProgress(Math.round(avg * 100));
        }
      };

      const newFileKeys = newFiles.map(fileKey);
      setUploadingKeys(prev => {
        const next = new Set(prev);
        for (const k of newFileKeys) next.add(k);
        return next;
      });

      const uploadId = uploadIdRef.current++;
      uploadProgressMapRef.current.set(uploadId, 0);
      setIsUploading(true);
      setUploadError(null);
      recompute();

      try {
        const { paths } = await uploadFiles(newFiles, (pct) => {
          uploadProgressMapRef.current.set(uploadId, pct);
          recompute();
        });
        newFiles.forEach((f, i) => pathMapRef.current.set(fileKey(f), paths[i]));
        emitPaths();
      } catch (err) {
        setUploadError(err.message || "Upload failed. Please try again.");
        emitPaths();
      } finally {
        uploadProgressMapRef.current.delete(uploadId);
        recompute();
        if (uploadProgressMapRef.current.size === 0) {
          setIsUploading(false);
        }
        setUploadingKeys(prev => {
          const next = new Set(prev);
          for (const k of newFileKeys) next.delete(k);
          return next;
        });
      }
    },
    [onInputCallback]
  );

  const clearUploadError = useCallback(() => setUploadError(null), []);

  return { imageInputHandler, isUploading, uploadingKeys, uploadProgress, uploadError, clearUploadError };
};
