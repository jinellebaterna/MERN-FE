import { useContext, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCitiesForCountry } from "../../../api/cities";

import ImageUpload from "../../shared/components/imageUpload/imageUpload";
import { useImageUpload } from "../../shared/hook/use-image-upload";
import { AuthContext } from "../../shared/context/auth-context";
import {
  fetchUserCountries,
  fetchUserById,
  addUserCountry,
  removeUserCountry,
  updateCountryImages,
  updateCountry,
  fetchUserWishlist,
  addToWishlist,
  toggleLikeCountry,
  addCountryComment,
  deleteCountryComment,
} from "../../../api/user";
import CountrySearch, { getFlagEmoji } from "../country-search/CountrySearch";
import LoadingSpinner from "../../shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../../shared/components/errorModal/errorModal";
import ContinentStats from "../continent-stats/continentStats";
import "./user-countries.css";

const IMG_BASE = "http://localhost:5001";

const UserCountries = () => {
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const viewedUserId = searchParams.get("user") || auth.userId;
  const canEdit = auth.userId === viewedUserId;
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [storyDraft, setStoryDraft] = useState("");
  const [cityInput, setCityInput] = useState("");

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityActiveIndex, setCityActiveIndex] = useState(-1);
  const [pendingCountry, setPendingCountry] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [pendingPaths, setPendingPaths] = useState([]);
  const [imageUploadKey, setImageUploadKey] = useState(0);

  const { data: viewedUser } = useQuery({
    queryKey: ["user", viewedUserId],
    queryFn: () => fetchUserById(viewedUserId),
    enabled: !!viewedUserId && !canEdit,
  });

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries", viewedUserId],
    queryFn: () => fetchUserCountries(viewedUserId),
    enabled: !!viewedUserId,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist", viewedUserId],
    queryFn: () => fetchUserWishlist(viewedUserId),
    enabled: !!viewedUserId,
  });

  const wishlistAddMutation = useMutation({
    mutationFn: ({ name, code }) =>
      addToWishlist({ userId: auth.userId, name, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", auth.userId] }),
    onError: (err) => setError(err.message),
  });

  const addMutation = useMutation({
    mutationFn: ({ name, code }) =>
      addUserCountry({ userId: auth.userId, name, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] }),
    onError: (err) => setError(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (code) =>
      removeUserCountry({ userId: auth.userId, code, token: auth.token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      setSelectedCountry(null);
    },
    onError: (err) => setError(err.message),
  });

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
      setSelectedCountry((prev) =>
        prev ? { ...prev, images: data.country.images } : null
      );
    },
    onError: (err) => setError(err.message),
  });

  const likeMutation = useMutation({
    mutationFn: ({ code }) =>
      toggleLikeCountry({ userId: viewedUserId, code, token: auth.token }),
    // eslint-disable-next-line no-unused-vars
    onSuccess: (data, { code }) => {
      setSelectedCountry((prev) =>
        prev ? { ...prev, likes: data.likes } : null
      );
      queryClient.invalidateQueries({ queryKey: ["countries", viewedUserId] });
    },
    onError: (err) => setError(err.message),
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
      setSelectedCountry((prev) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), data.comment] }
          : null
      );
      setCommentInput("");
    },
    onError: (err) => setError(err.message),
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
      setSelectedCountry((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c.id !== commentId),
            }
          : null
      );
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, story, cities }) =>
      updateCountry({
        userId: auth.userId,
        code,
        story,
        cities,
        token: auth.token,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      setSelectedCountry((prev) =>
        prev ? { ...prev, ...data.country } : null
      );
    },
    onError: (err) => setError(err.message),
  });

  const handleSave = async () => {
    try {
      const tasks = [
        updateMutation.mutateAsync({
          code: selectedCountry.code,
          story: storyDraft,
          cities: selectedCountry.cities,
        }),
      ];
      if (pendingPaths.length > 0) {
        tasks.push(
          imagesMutation.mutateAsync({
            code: selectedCountry.code,
            addImages: pendingPaths,
            removeImages: [],
          })
        );
      }
      await Promise.all(tasks);
      setSelectedCountry(null);
      setPendingPaths([]);
      setImageUploadKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveImage = (imgPath) => {
    imagesMutation.mutate({
      code: selectedCountry.code,
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

  const openModal = async (country) => {
    setSelectedCountry(country);
    setStoryDraft(country.story || "");
    setPendingPaths([]);
    setImageUploadKey((k) => k + 1);
    const cities = await fetchCitiesForCountry(country.name);
    setCitySuggestions(cities);
  };

  const closeModal = () => {
    setSelectedCountry(null);
    setPendingPaths([]);
    setImageUploadKey((k) => k + 1);
  };

  if (isLoading) return <LoadingSpinner asOverlay />;

  return (
    <div className="user-countries">
      <ErrorModal
        error={error || uploadError}
        onClear={() => {
          setError(null);
          clearUploadError();
        }}
      />
      {canEdit && (
        <div className="user-countries__search-wrap">
          <CountrySearch
            excludeCodes={[
              ...countries.map((c) => c.code),
              ...wishlist.map((c) => c.code),
            ]}
            onSelect={(country) => setPendingCountry(country)}
          />
          {pendingCountry && (
            <div className="user-countries__pending">
              <span className="user-countries__pending-flag">
                {getFlagEmoji(pendingCountry.code)}
              </span>
              <span className="user-countries__pending-name">
                {pendingCountry.name}
              </span>
              <button
                className="user-countries__pending-btn user-countries__pending-btn--visited"
                onClick={() => {
                  addMutation.mutate(pendingCountry);
                  setPendingCountry(null);
                }}
              >
                ✓ Visited
              </button>
              <button
                className="user-countries__pending-btn user-countries__pending-btn--wishlist"
                onClick={() => {
                  wishlistAddMutation.mutate(pendingCountry);
                  setPendingCountry(null);
                }}
              >
                ♡ Want to Visit
              </button>
              <button
                className="user-countries__pending-cancel"
                onClick={() => setPendingCountry(null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
      )}
      <div className="user-countries__header">
        <h2>
          {canEdit
            ? "My Countries"
            : `${viewedUser?.name ?? "Their"} Countries`}
          <span className="user-countries__count">{countries.length}</span>
        </h2>
      </div>

      {countries.length === 0 && (
        <div className="user-countries__empty">
          {canEdit
            ? "No countries yet. Search above to add your first visited country!"
            : "No countries visited yet."}
        </div>
      )}
      <ContinentStats countries={countries} />
      <div className="user-countries__grid">
        {countries.map((country) => (
          <div
            key={country.code}
            className="country-card"
            onClick={() => openModal(country)}
          >
            <div className="country-card__flag">
              {getFlagEmoji(country.code)}
            </div>
            <div className="country-card__name">{country.name}</div>
          </div>
        ))}
      </div>

      {selectedCountry && (
        <div className="country-modal__backdrop" onClick={closeModal}>
          <div className="country-modal" onClick={(e) => e.stopPropagation()}>
            <div className="country-modal__header">
              <span className="country-modal__flag">
                {getFlagEmoji(selectedCountry.code)}
              </span>
              <h3>{selectedCountry.name}</h3>
              <button className="country-modal__close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="country-modal__gallery">
              {selectedCountry.images.length === 0 && (
                <p className="country-modal__no-photos">No photos yet.</p>
              )}
              {selectedCountry.images.map((img) => (
                <div key={img} className="country-modal__photo-wrap">
                  <img
                    src={`${IMG_BASE}/${img}`}
                    alt={selectedCountry.name}
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

            <div className="country-modal__body">
              {canEdit && (
                <div className="country-modal__upload-section">
                  <h4>Add Photos</h4>
                  <ImageUpload
                    key={imageUploadKey}
                    id="country-images"
                    multiple
                    maxFiles={10}
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
                  <p>{selectedCountry.story || "No story written yet."}</p>
                )}
              </div>

              <div className="country-modal__cities">
                <h4>Cities Visited</h4>
                <div className="country-modal__city-tags">
                  {(selectedCountry.cities || []).map((city) => (
                    <span key={city} className="city-tag">
                      {city}
                      {canEdit && (
                        <button
                          onClick={() => {
                            const updated = selectedCountry.cities.filter(
                              (c) => c !== city
                            );
                            updateMutation.mutate({
                              code: selectedCountry.code,
                              story: storyDraft,
                              cities: updated,
                            });
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
                              c
                                .toLowerCase()
                                .includes(cityInput.toLowerCase()) &&
                              !(selectedCountry.cities || []).includes(c)
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
                          const updated = [
                            ...(selectedCountry.cities || []),
                            toAdd,
                          ];
                          updateMutation.mutate({
                            code: selectedCountry.code,
                            story: storyDraft,
                            cities: updated,
                          });
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
                              c
                                .toLowerCase()
                                .includes(cityInput.toLowerCase()) &&
                              !(selectedCountry.cities || []).includes(c)
                          )
                          .slice(0, 8);
                        return filtered.length > 0 ? (
                          <ul className="country-modal__city-dropdown">
                            {filtered.map((city, i) => (
                              <li
                                key={city}
                                className={`country-modal__city-option${i === cityActiveIndex ? " country-modal__city-option--active" : ""}`}
                                onMouseDown={() => {
                                  const updated = [
                                    ...(selectedCountry.cities || []),
                                    city,
                                  ];
                                  updateMutation.mutate({
                                    code: selectedCountry.code,
                                    story: storyDraft,
                                    cities: updated,
                                  });
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
                        (selectedCountry.likes || []).includes(auth.userId)
                          ? " country-modal__like-btn--liked"
                          : ""
                      }`}
                      onClick={() =>
                        likeMutation.mutate({ code: selectedCountry.code })
                      }
                      disabled={likeMutation.isPending}
                    >
                      ♥ {(selectedCountry.likes || []).length}
                    </button>
                  )}
                  {!auth.isLoggedIn && (
                    <span className="country-modal__like-count">
                      ♥ {(selectedCountry.likes || []).length}
                    </span>
                  )}
                </div>

                <div className="country-modal__comments">
                  <h4>Comments</h4>
                  {(selectedCountry.comments || []).length === 0 && (
                    <p className="country-modal__no-comments">
                      No comments yet.
                    </p>
                  )}
                  {(selectedCountry.comments || []).map((comment) => (
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
                              code: selectedCountry.code,
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
                              code: selectedCountry.code,
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
                    disabled={
                      updateMutation.isPending || imagesMutation.isPending
                    }
                  >
                    {updateMutation.isPending || imagesMutation.isPending
                      ? "Saving..."
                      : "Save"}
                  </button>
                  <button
                    className="country-modal__btn country-modal__btn--remove"
                    onClick={() => removeMutation.mutate(selectedCountry.code)}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending
                      ? "Removing..."
                      : "Remove Country"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCountries;
