import { useState, useEffect, useCallback, useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchCitiesForCountry } from "../../api/cities";
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
import { formatDate } from "../../utils/formatDate";
import useScrollLock from "../../hook/use-scroll-lock";
import { MONTHS } from "../../data/data";
import CountryGallery from "./country-gallery";
import CountryCities from "./country-cities";
import CountryComments from "./country-comments";

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

  const handleCitiesChange = (newCities) => {
    setCountry((prev) => ({ ...prev, cities: newCities }));
    updateMutation.mutate({
      code: country.code,
      story: storyDraft,
      cities: newCities,
      ratings: ratingsDraft,
      visitedAt:
        visitedMonth && visitedYear
          ? `${visitedYear}-${String(visitedMonth).padStart(2, "0")}`
          : null,
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
          <CountryGallery
            country={country}
            canEdit={canEdit}
            // pendingPaths={pendingPaths}
            imageUploadKey={imageUploadKey}
            imageInputHandler={imageInputHandler}
            uploadingKeys={uploadingKeys}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            clearUploadError={clearUploadError}
            onRemoveImage={handleRemoveImage}
          />

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
              <span>🗓 Visited: {formatDate(country.visitedAt, "long")}</span>
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

          <CountryCities
            country={country}
            canEdit={canEdit}
            cityInput={cityInput}
            setCityInput={setCityInput}
            citySuggestions={citySuggestions}
            cityActiveIndex={cityActiveIndex}
            setCityActiveIndex={setCityActiveIndex}
            onCitiesChange={handleCitiesChange}
          />

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

            <CountryComments
              country={country}
              canEdit={canEdit}
              commentInput={commentInput}
              setCommentInput={setCommentInput}
              commentMutation={commentMutation}
              deleteCommentMutation={deleteCommentMutation}
            />
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
