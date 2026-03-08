import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  reorderWishlist,
  addUserCountry,
  fetchUserWishlist,
  removeFromWishlist,
  updateWishlistDetails,
} from "../../api/user";

import { AuthContext } from "../context/auth-context";
import { getFlagEmoji } from "../country-search/country-search";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/errorModal/errorModal";
import {
  geocodeAddress,
  fetchMonthlyClimate,
  fetchCountryInfo,
  fetchWeather,
  getBestMonths,
} from "../../api/weather";
import { WMO_CODES } from "../../data/data";
import ClimateChart from "../climate-chart/climate-chart";

import "./user-wishlist.css";

const SortableWishlistCard = ({
  country,
  onRemove,
  canEdit,
  isRemoving,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: country.code });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: canEdit ? "grab" : "default",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canEdit ? listeners : {})}
      className="wishlist-card"
      onClick={() => onClick(country)}
    >
      <div className="wishlist-card__flag">{getFlagEmoji(country.code)}</div>
      <div className="wishlist-card__name">{country.name}</div>
      <div className="wishlist-card__date">
        {new Date(country.addedAt).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        })}
      </div>
      {canEdit && (
        <button
          className="wishlist-card__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(country.code);
          }}
          disabled={isRemoving}
          title="Remove"
        >
          &times;
        </button>
      )}
    </div>
  );
};

const UserWishlist = () => {
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const viewedUserId = searchParams.get("user") || auth.userId;
  const canEdit = auth.userId === viewedUserId;
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [coords, setCoords] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [bestMonths, setBestMonths] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState("medium");
  const [targetYearDraft, setTargetYearDraft] = useState("");
  const [weather, setWeather] = useState(null);
  const [savedIndicator, setSavedIndicator] = useState(false);

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist", viewedUserId],
    queryFn: () => fetchUserWishlist(viewedUserId),
    enabled: !!viewedUserId && canEdit,
  });

  const [localWishlist, setLocalWishlist] = useState(wishlist);

  const removeMutation = useMutation({
    mutationFn: (code) =>
      removeFromWishlist({ userId: auth.userId, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", auth.userId] }),
    onError: (err) => setError(err.message),
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalWishlist(wishlist), [wishlist]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const reorderMutation = useMutation({
    mutationFn: reorderWishlist,
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", viewedUserId] }),
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localWishlist.findIndex((c) => c.code === active.id);
    const newIndex = localWishlist.findIndex((c) => c.code === over.id);
    const reordered = arrayMove(localWishlist, oldIndex, newIndex);
    setLocalWishlist(reordered);
    reorderMutation.mutate({
      userId: auth.userId,
      codes: reordered.map((c) => c.code),
      token: auth.token,
    });
  };

  const openModal = async (country) => {
    setSelectedCountry(country);
    setCoords(null);
    setCountryInfo(null);
    setBestMonths(null);
    setNotesDraft(country.notes || "");
    setPriorityDraft(country.priority || "medium");
    setTargetYearDraft(country.targetYear ? String(country.targetYear) : "");

    fetchCountryInfo(country.code)
      .then(setCountryInfo)
      .catch(() => {});

    geocodeAddress(country.name)
      .then(async ({ lat, lon }) => {
        setCoords({ lat, lon });
        fetchWeather(lat, lon)
          .then(setWeather)
          .catch(() => {});
        const climate = await fetchMonthlyClimate(lat, lon);
        setBestMonths(getBestMonths(climate));
      })
      .catch(() => {});
  };

  const closeModal = () => {
    setSelectedCountry(null);
    setCoords(null);
    setCountryInfo(null);
    setBestMonths(null);
    setNotesDraft("");
    setPriorityDraft("medium");
    setTargetYearDraft("");
    setWeather(null);
    setSavedIndicator(false);
  };

  const markVisitedMutation = useMutation({
    mutationFn: ({ name, code }) =>
      addUserCountry({ userId: auth.userId, name, code, token: auth.token }),
    onSuccess: (_, { code }) => {
      removeMutation.mutate(code);
      queryClient.invalidateQueries({ queryKey: ["countries", auth.userId] });
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const detailsMutation = useMutation({
    mutationFn: ({ code, notes, priority, targetYear }) =>
      updateWishlistDetails({
        userId: auth.userId,
        code,
        notes,
        priority,
        targetYear,
        token: auth.token,
      }),
    onSuccess: (data) => {
      setSelectedCountry((prev) =>
        prev ? { ...prev, ...data.country } : null
      );
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1500);
    },
    onError: (err) => setError(err.message),
  });

  // All early returns AFTER hooks
  if (isLoading) return <LoadingSpinner asOverlay />;
  if (!canEdit) return null;

  return (
    <div className="user-wishlist">
      <ErrorModal error={error} onClear={() => setError(null)} />

      <div className="user-wishlist__header">
        <h2>
          {canEdit ? "My Bucket List" : "Bucket List"}
          <span className="user-wishlist__count">{wishlist.length}</span>
        </h2>
      </div>

      {wishlist.length === 0 && (
        <div className="user-wishlist__empty">
          {canEdit
            ? "Add countries you want to visit using the search above!"
            : "No bucket list countries yet."}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={canEdit ? handleDragEnd : undefined}
      >
        <SortableContext
          items={localWishlist.map((c) => c.code)}
          strategy={rectSortingStrategy}
        >
          <div className="user-wishlist__grid">
            {localWishlist.map((country) => (
              <SortableWishlistCard
                key={country.code}
                country={country}
                onClick={openModal}
                onRemove={(code) => removeMutation.mutate(code)}
                canEdit={canEdit}
                isRemoving={removeMutation.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

            <div className="country-modal__body">
              {(bestMonths || countryInfo) && (
                <div className="wishlist-modal__info-strip">
                  {bestMonths && <span>📅 Best Time: {bestMonths}</span>}
                  {countryInfo?.currency && (
                    <span>💰 Currency: {countryInfo.currency}</span>
                  )}
                  {countryInfo?.language && (
                    <span>🗣 Language: {countryInfo.language}</span>
                  )}
                  {weather && (
                    <span>
                      {WMO_CODES[weather.weather_code] ?? "🌡️ "}{" "}
                      {weather.temperature_2m}°
                    </span>
                  )}
                </div>
              )}

              <ClimateChart lat={coords?.lat} lon={coords?.lon} />

              {canEdit && savedIndicator && (
                <span className="wishlist-modal__saved">Saved ✓</span>
              )}

              {canEdit && (
                <div className="wishlist-modal__planning">
                  <div className="wishlist-modal__field">
                    <label>🔥 Priority</label>
                    <select
                      value={priorityDraft}
                      onChange={(e) => {
                        setPriorityDraft(e.target.value);
                        detailsMutation.mutate({
                          code: selectedCountry.code,
                          notes: notesDraft,
                          priority: e.target.value,
                          targetYear: targetYearDraft
                            ? Number(targetYearDraft)
                            : null,
                        });
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="wishlist-modal__field">
                    <label>🎯 Target Year</label>
                    <input
                      type="number"
                      value={targetYearDraft}
                      min={new Date().getFullYear()}
                      max={2100}
                      placeholder="e.g. 2027"
                      onChange={(e) => setTargetYearDraft(e.target.value)}
                      onBlur={() =>
                        detailsMutation.mutate({
                          code: selectedCountry.code,
                          notes: notesDraft,
                          priority: priorityDraft,
                          targetYear: targetYearDraft
                            ? Number(targetYearDraft)
                            : null,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="country-modal__notes">
                <h4>📝 Notes</h4>
                {canEdit ? (
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Why do you want to visit? What do you want to do there?"
                    rows={3}
                    onBlur={() => {
                      if (notesDraft !== (selectedCountry.notes || ""))
                        detailsMutation.mutate({
                          code: selectedCountry.code,
                          notes: notesDraft,
                          priority: priorityDraft,
                          targetYear: targetYearDraft
                            ? Number(targetYearDraft)
                            : null,
                        });
                    }}
                  />
                ) : (
                  <p>{selectedCountry.notes || "No notes."}</p>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="country-modal__actions">
                <button
                  className="country-modal__btn country-modal__btn--save"
                  onClick={() =>
                    markVisitedMutation.mutate({
                      name: selectedCountry.name,
                      code: selectedCountry.code,
                    })
                  }
                  disabled={
                    markVisitedMutation.isPending || removeMutation.isPending
                  }
                >
                  {markVisitedMutation.isPending
                    ? "Moving..."
                    : "✓ Mark as Visited"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
