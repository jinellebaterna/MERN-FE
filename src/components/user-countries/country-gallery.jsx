import ImageUpload from "../shared/imageUpload/imageUpload";
import { IMG_BASE } from "../../data/data";

const CountryGallery = ({
  country,
  canEdit,
  // pendingPaths,
  imageUploadKey,
  imageInputHandler,
  uploadingKeys,
  uploadProgress,
  uploadError,
  clearUploadError,
  onRemoveImage,
}) => {
  return (
    <>
      <div className="country-modal__gallery">
        {country.images.length === 0 && (
          <p className="country-modal__no-photos">No photos yet.</p>
        )}
        {country.images.map((img) => (
          <div key={img} className="country-modal__photo-wrap">
            <img
              src={`${IMG_BASE}/${img}`}
              alt={country.name}
              className="country-modal__photo"
            />
            {canEdit && (
              <button
                className="country-modal__remove-photo"
                onClick={() => onRemoveImage(img)}
                title="Remove photo"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {uploadError && (
        <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>
          {uploadError}
          <button onClick={clearUploadError} style={{ marginLeft: "0.5rem" }}>
            ✕
          </button>
        </p>
      )}

      {canEdit && (
        <div className="country-modal__upload-section">
          <h4>Add Photos</h4>
          <p className="country-modal__upload-hint">
            Upload your top 5 photos from this trip
          </p>
          <ImageUpload
            key={imageUploadKey}
            id="country-images"
            multiple
            maxFiles={5}
            onInput={imageInputHandler}
            uploadingKeys={uploadingKeys}
          />
          {uploadProgress !== null && (
            <div className="upload-progress">
              <div className="upload-progress__bar-track">
                <div
                  className="upload-progress__bar"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="upload-progress__label">
                Uploading... {uploadProgress}%
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CountryGallery;
