import { useState, useEffect, useCallback, useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchCitiesForCountry } from "../../api/cities";
import ImageUpload from "../shared/imageUpload/imageUpload";
import StarRating from "../shared/starRating/starRating";
import "../shared/starRating/starRating.css";
import { useImageUpload } from "../../hook/use-image-upload";
import { AuthContext } from "../context/auth-context";
import {
  updateCountryImages,
  updateCountry,
  removeUserCountry,
  toggleLikeCountry,
  addCountryComment,
  deleteCountryComment,
} from "../../api/user";
import { getFlagEmoji } from "../../utils/flags";
import useScrollLock from "../../hook/use-scroll-lock";
import { IMG_BASE, MONTHS } from "../../data/data";

const CountryModal = ({
  country: initialCountry,
  canEdit,
  viewedUserId,
  onClose,
}) => {
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [country, setCountry] = useState(initialCountry);
  const [storyDraft, setStoryDraft] = useState(initialCountry.story || "");
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityActiveIndex, setCityActiveIndex] = useState(-1);
  const [commentInput, setCommentInput] = useState("");
  const [pendingPaths, setPendingPaths] = useState([]);
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [ratingsDraft, setRatingsDraft] = useState({
    food: country.ratings?.food ?? 0,
    nature: country.ratings?.nature ?? 0,
    cost: country.ratings?.cost ?? 0,
    transport: country.ratings?.transport ?? 0,
    shopping: country.ratings?.shopping ?? 0,
  });
  const [visitedMonth, setVisitedMonth] = useState(
    initialCountry.visitedAt
      ? new Date(initialCountry.visitedAt).getMonth() + 1
      : ""
  );
  const [visitedYear, setVisitedYear] = useState(
    initialCountry.visitedAt
      ? new Date(initialCountry.visitedAt).getFullYear()
      : ""
  );

  useEffect(() => {
    fetchCitiesForCountry(country.name)
      .then(setCitySuggestions)
      .catch(() => {});
  }, [country.name]);

  const imagesMutation = useMutation({
    mutationFn: ({ code, addImages, removeImages }) =>
      updateCountryImages({
        userId: auth.userId,
        code,
        addImages,
        removeImages,
        token: auth.token,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      setCountry((prev) => ({ ...prev, images: data.country.images }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, story, cities, ratings, visitedAt }) =>
      updateCountry({
        userId: auth.userId,
        code,
        story,
        cities,
        ratings,
        visitedAt,
        token: auth.token,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      setCountry((prev) => ({ ...prev, ...data.country }));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (code) =>
      removeUserCountry({ userId: auth.userId, code, token: auth.token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      onClose();
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ code }) =>
      toggleLikeCountry({ userId: viewedUserId, code, token: auth.token }),
    onSuccess: (data) => {
      setCountry((prev) => ({ ...prev, likes: data.likes }));
      queryClient.invalidateQueries({ queryKey: ["countries", viewedUserId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ code, text }) =>
      addCountryComment({
        userId: viewedUserId,
        code,
        text,
        token: auth.token,
      }),
    onSuccess: (data) => {
      setCountry((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment],
      }));
      setCommentInput("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ code, commentId }) =>
      deleteCountryComment({
        userId: viewedUserId,
        code,
        commentId,
        token: auth.token,
      }),
    onSuccess: (_, { commentId }) => {
      setCountry((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
    },
  });

  const handleSave = async () => {
    const tasks = [
      updateMutation.mutateAsync({
        code: country.code,
        story: storyDraft,
        cities: country.cities,
        ratings: ratingsDraft,
        visitedAt:
          visitedMonth && visitedYear
            ? `${visitedYear}-${String(visitedMonth).padStart(2, "0")}`
            : null,
      }),
    ];
    if (pendingPaths.length > 0) {
      tasks.push(
        imagesMutation.mutateAsync({
          code: country.code,
          addImages: pendingPaths,
          removeImages: [],
        })
      );
    }
    await Promise.all(tasks);
    setPendingPaths([]);
    setImageUploadKey((k) => k + 1);
    onClose();
  };

  const handleRemoveImage = (imgPath) => {
    imagesMutation.mutate({
      code: country.code,
      addImages: [],
      removeImages: [imgPath],
    });
  };

  const handleImagePaths = useCallback((id, paths, isValid) => {
    setPendingPaths(isValid ? paths : []);
  }, []);

  const {
    imageInputHandler,
    uploadingKeys,
    uploadProgress,
    uploadError,
    clearUploadError,
  } = useImageUpload(handleImagePaths);

  const handleRatingChange = (category, value) => {
    const updated = { ...ratingsDraft, [category]: value };
    setRatingsDraft(updated);
    updateMutation.mutate({
      code: country.code,
      story: storyDraft,
      cities: country.cities,
      ratings: updated,
    });
  };

  const handleVisitedAtChange = (month, year) => {
    setVisitedMonth(month);
    setVisitedYear(year);
    const visitedAt =
      month && year ? `${year}-${String(month).padStart(2, "0")}` : null;
    updateMutation.mutate({
      code: country.code,
      story: storyDraft,
      cities: country.cities,
      ratings: ratingsDraft,
      visitedAt,
    });
  };

  useScrollLock(true);

  return (
    <div className="country-modal__backdrop" onClick={onClose}>
      <div className="country-modal" onClick={(e) => e.stopPropagation()}>
        <div className="country-modal__header">
          <span className="country-modal__flag">
            {getFlagEmoji(country.code)}
          </span>
          <h3>{country.name}</h3>
          <button className="country-modal__close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="country-modal__body">
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
                    onClick={() => handleRemoveImage(img)}
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
              <button
                onClick={clearUploadError}
                style={{ marginLeft: "0.5rem" }}
              >
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

          {canEdit && (
            <div className="country-modal__visited-date">
              <label>🗓 Date Visited</label>
              <div className="country-modal__visited-selects">
                <select
                  value={visitedMonth}
                  onChange={(e) =>
                    handleVisitedAtChange(e.target.value, visitedYear)
                  }
                >
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={visitedYear}
                  onChange={(e) =>
                    handleVisitedAtChange(visitedMonth, e.target.value)
                  }
                >
                  <option value="">Year</option>
                  {Array.from(
                    { length: new Date().getFullYear() - 1949 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                {(visitedMonth || visitedYear) && (
                  <button
                    type="button"
                    className="country-modal__visited-clear"
                    onClick={() => handleVisitedAtChange("", "")}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          )}
          {!canEdit && country.visitedAt && (
            <div className="country-modal__visited-date">
              <span>
                🗓 Visited:{" "}
                {new Date(country.visitedAt).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          <div className="country-modal__ratings">
            <h4>{canEdit ? "My Ratings" : "Ratings"}</h4>
            {[
              { key: "food", label: "🍜 Food" },
              { key: "nature", label: "🌿 Nature" },
              { key: "cost", label: "💸 Cost" },
              { key: "transport", label: "🚌 Transport" },
              { key: "shopping", label: "🛍️  Shopping" },
            ].map(({ key, label }) => (
              <div key={key} className="country-modal__rating-row">
                <span className="country-modal__rating-label">{label}</span>
                <StarRating
                  value={ratingsDraft[key]}
                  onChange={(val) => handleRatingChange(key, val)}
                  readOnly={!canEdit}
                />
              </div>
            ))}
          </div>

          <div className="country-modal__story">
            <h4>Travel Story</h4>
            {canEdit ? (
              <textarea
                value={storyDraft}
                onChange={(e) => setStoryDraft(e.target.value)}
                placeholder="Write about your trip..."
                rows={4}
              />
            ) : (
              <p>{country.story || "No story written yet."}</p>
            )}
          </div>

          <div className="country-modal__cities">
            <h4>Cities Visited</h4>
            <div className="country-modal__city-tags">
              {(country.cities || []).map((city) => (
                <span key={city} className="city-tag">
                  {city}
                  {canEdit && (
                    <button
                      onClick={() => {
                        const updated = country.cities.filter(
                          (c) => c !== city
                        );
                        updateMutation.mutate({
                          code: country.code,
                          story: storyDraft,
                          cities: updated,
                        });
                        setCountry((prev) => ({ ...prev, cities: updated }));
                      }}
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
            {canEdit && (
              <div className="country-modal__city-input">
                <input
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setCityActiveIndex(-1);
                  }}
                  placeholder="Add a city..."
                  autoComplete="off"
                  onKeyDown={(e) => {
                    const filtered = citySuggestions
                      .filter(
                        (c) =>
                          c.toLowerCase().includes(cityInput.toLowerCase()) &&
                          !(country.cities || []).includes(c)
                      )
                      .slice(0, 8);

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCityActiveIndex((i) =>
                        Math.min(i + 1, filtered.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCityActiveIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Escape") {
                      setCityActiveIndex(-1);
                      setCityInput("");
                    } else if (e.key === "Enter" && cityInput.trim()) {
                      e.preventDefault();
                      const toAdd =
                        cityActiveIndex >= 0 && filtered[cityActiveIndex]
                          ? filtered[cityActiveIndex]
                          : cityInput.trim();
                      const updated = [...(country.cities || []), toAdd];
                      updateMutation.mutate({
                        code: country.code,
                        story: storyDraft,
                        cities: updated,
                      });
                      setCountry((prev) => ({ ...prev, cities: updated }));
                      setCityInput("");
                      setCityActiveIndex(-1);
                    }
                  }}
                />
                {cityInput.trim() &&
                  (() => {
                    const filtered = citySuggestions
                      .filter(
                        (c) =>
                          c.toLowerCase().includes(cityInput.toLowerCase()) &&
                          !(country.cities || []).includes(c)
                      )
                      .slice(0, 8);
                    return filtered.length > 0 ? (
                      <ul className="country-modal__city-dropdown">
                        {filtered.map((city, i) => (
                          <li
                            key={city}
                            className={`country-modal__city-option${i === cityActiveIndex ? " country-modal__city-option--active" : ""}`}
                            onMouseDown={() => {
                              const updated = [...(country.cities || []), city];
                              updateMutation.mutate({
                                code: country.code,
                                story: storyDraft,
                                cities: updated,
                              });
                              setCountry((prev) => ({
                                ...prev,
                                cities: updated,
                              }));
                              setCityInput("");
                              setCityActiveIndex(-1);
                            }}
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
              </div>
            )}
          </div>

          <div className="country-modal__social">
            <div className="country-modal__likes">
              {auth.isLoggedIn && (
                <button
                  className={`country-modal__like-btn${
                    (country.likes || []).includes(auth.userId)
                      ? " country-modal__like-btn--liked"
                      : ""
                  }`}
                  onClick={() => likeMutation.mutate({ code: country.code })}
                  disabled={likeMutation.isPending}
                >
                  ♥ {(country.likes || []).length}
                </button>
              )}
              {!auth.isLoggedIn && (
                <span className="country-modal__like-count">
                  ♥ {(country.likes || []).length}
                </span>
              )}
            </div>

            <div className="country-modal__comments">
              <h4>Comments</h4>
              {(country.comments || []).length === 0 && (
                <p className="country-modal__no-comments">No comments yet.</p>
              )}
              {(country.comments || []).map((comment) => (
                <div key={comment.id} className="country-modal__comment">
                  <span className="country-modal__comment-author">
                    {comment.user?.name || "User"}
                  </span>
                  <span className="country-modal__comment-text">
                    {comment.text}
                  </span>
                  {(auth.userId === comment.user?._id || canEdit) && (
                    <button
                      className="country-modal__comment-delete"
                      onClick={() =>
                        deleteCommentMutation.mutate({
                          code: country.code,
                          commentId: comment.id,
                        })
                      }
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              {auth.isLoggedIn && (
                <div className="country-modal__comment-input">
                  <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentInput.trim()) {
                        commentMutation.mutate({
                          code: country.code,
                          text: commentInput,
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="country-modal__actions">
          {canEdit && (
            <>
              <button
                className="country-modal__btn country-modal__btn--save"
                onClick={handleSave}
                disabled={updateMutation.isPending || imagesMutation.isPending}
              >
                {updateMutation.isPending || imagesMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </button>
              <button
                className="country-modal__btn country-modal__btn--remove"
                onClick={() => removeMutation.mutate(country.code)}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? "Removing..." : "Remove Country"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryModal;
