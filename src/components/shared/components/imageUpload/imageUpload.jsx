import { useRef, useState, useEffect } from "react";
import Button from "../button/button";
import "./imageUpload.css";

const ImageUpload = (props) => {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const filePickerRef = useRef();

  useEffect(() => {
    if (!files.length) return;
    const urls = [];
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result);
        if (urls.length === files.length) setPreviewUrls([...urls]);
      };
      reader.readAsDataURL(f);
    });
  }, [files]);

  const pickedHandler = (event) => {
    const picked = Array.from(event.target.files);
    if (!picked.length) {
      props.onInput(props.id, props.multiple ? [] : null, false);
      return;
    }
    setFiles(picked);
    props.onInput(props.id, props.multiple ? picked : picked[0], true);
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  const removeImage = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
    props.onInput(props.id, updatedFiles, updatedFiles.length > 0);
  };

  return (
    <div>
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type={"file"}
        accept=".jpg, .png, .jpeg"
        multiple={!!props.multiple}
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {props.multiple
            ? previewUrls.map((url, i) => (
                <div key={i} className="image-upload__preview-item">
                  <img src={url} alt={`preview ${i}`} />
                  <button type="button" onClick={() => removeImage(i)}>
                    ✕
                  </button>
                </div>
              ))
            : previewUrls[0] && <img src={previewUrls[0]} alt="preview" />}

          <Button type="button" onClick={pickImageHandler}>
            {props.multiple ? "PICK IMAGES" : "PICK IMAGE"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
