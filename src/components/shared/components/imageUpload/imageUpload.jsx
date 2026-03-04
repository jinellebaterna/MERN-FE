import { useRef, useState, useEffect, useCallback } from "react";
import Button from "../button/button";
import "./imageUpload.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const WARN_FILE_SIZE = 8 * 1024 * 1024; // warn at 8MB

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ImageUpload = (props) => {
  const maxFiles = props.maxFiles || 5;
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const filePickerRef = useRef();

  useEffect(() => {
    if (!files.length) {
      setPreviewUrls([]);
      return;
    }
    const urls = new Array(files.length);
    let loaded = 0;
    files.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls[i] = reader.result;
        loaded++;
        if (loaded === files.length) setPreviewUrls([...urls]);
      };
      reader.readAsDataURL(f);
    });
  }, [files]);

  const processFiles = useCallback(
    (newFiles) => {
      const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
      const dupes = [];
      const unique = newFiles.filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (existingKeys.has(key)) {
          dupes.push(f.name);
          return false;
        }
        return true;
      });

      const sizeWarnings = unique
        .filter((f) => f.size > WARN_FILE_SIZE && f.size <= MAX_FILE_SIZE)
        .map((f) => `${f.name} is large (${formatSize(f.size)})`);

      const valid = unique.filter((f) => f.size <= MAX_FILE_SIZE);
      const tooLarge = unique
        .filter((f) => f.size > MAX_FILE_SIZE)
        .map((f) => `${f.name} exceeds 10MB and was skipped`);

      setWarnings([
        ...dupes.map((n) => `"${n}" is already selected`),
        ...sizeWarnings,
        ...tooLarge,
      ]);

      const merged = [...files, ...valid].slice(0, maxFiles);
      setFiles(merged);
      props.onInput(props.id, merged, merged.length > 0);
    },
    [files, maxFiles, props]
  );

  const pickedHandler = (event) => {
    const picked = Array.from(event.target.files);
    if (!picked.length) return;
    if (props.multiple) {
      processFiles(picked);
    } else {
      setFiles([picked[0]]);
      props.onInput(props.id, picked[0], true);
    }
    event.target.value = "";
  };

  const removeImage = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    props.onInput(
      props.id,
      props.multiple ? updatedFiles : null,
      updatedFiles.length > 0
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      ["image/png", "image/jpeg", "image/jpg"].includes(f.type)
    );
    if (!dropped.length) return;
    if (props.multiple) {
      processFiles(dropped);
    } else {
      setFiles([dropped[0]]);
      props.onInput(props.id, dropped[0], true);
    }
  };

  const handleItemDragStart = (index) => setDragIndex(index);

  const handleItemDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reorderedFiles = [...files];
    const reorderedUrls = [...previewUrls];
    reorderedFiles.splice(index, 0, reorderedFiles.splice(dragIndex, 1)[0]);
    reorderedUrls.splice(index, 0, reorderedUrls.splice(dragIndex, 1)[0]);
    setFiles(reorderedFiles);
    setPreviewUrls(reorderedUrls);
    setDragIndex(index);
    props.onInput(props.id, reorderedFiles, reorderedFiles.length > 0);
  };

  const handleItemDragEnd = () => setDragIndex(null);

  const pickImageHandler = () => filePickerRef.current.click();

  const canAddMore = props.multiple && files.length < maxFiles;

  return (
    <div className="image-upload-wrapper">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".jpg, .png, .jpeg"
        multiple={!!props.multiple}
        onChange={pickedHandler}
      />

      {/* Drop zone */}
      {files.length === 0 ? (
        <div
          className={`image-upload__dropzone ${isDragging ? "image-upload__dropzone--active" : ""} ${props.center ? "center" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={pickImageHandler}
        >
          <div className="image-upload__dropzone-icon">🖼️</div>
          <p>Drag & drop {props.multiple ? "images" : "an image"} here</p>
          <p className="image-upload__dropzone-hint">
            or click to browse · .jpg .jpeg .png · max 10MB
            {props.multiple ? ` · up to ${maxFiles} images` : ""}
          </p>
        </div>
      ) : (
        !props.multiple && (
          <div
            className={`image-upload__dropzone image-upload__dropzone--has-file ${isDragging ? "image-upload__dropzone--active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={pickImageHandler}
          >
            <img src={previewUrls[0]} alt="preview" />
          </div>
        )
      )}

      {/* Multiple image previews */}
      {props.multiple && files.length > 0 && (
        <>
          <div className="image-upload__count">
            {files.length}/{maxFiles} images selected
            {canAddMore && (
              <button
                type="button"
                className="image-upload__add-more"
                onClick={pickImageHandler}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                + Add more
              </button>
            )}
          </div>
          <div className="image-upload__grid">
            {files.map((file, i) => (
              <div
                key={i}
                className={`image-upload__preview-item ${dragIndex === i ? "image-upload__preview-item--dragging" : ""}`}
                draggable
                onDragStart={() => handleItemDragStart(i)}
                onDragOver={(e) => handleItemDragOver(e, i)}
                onDragEnd={handleItemDragEnd}
              >
                {i === 0 && (
                  <span className="image-upload__cover-badge">Cover</span>
                )}
                <img src={previewUrls[i]} alt={`preview ${i}`} />
                <div className="image-upload__item-info">
                  <span className="image-upload__item-name" title={file.name}>
                    {file.name}
                  </span>
                  <span
                    className={`image-upload__item-size ${file.size > WARN_FILE_SIZE ? "image-upload__item-size--warn" : ""}`}
                  >
                    {formatSize(file.size)}
                    {file.size > WARN_FILE_SIZE ? " ⚠️" : ""}
                  </span>
                </div>
                <button
                  type="button"
                  className="image-upload__remove-btn"
                  onClick={() => removeImage(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <ul className="image-upload__warnings">
          {warnings.map((w, i) => (
            <li key={i}>⚠️ {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImageUpload;
