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
import { reorderWishlist } from "../../api/user";

import { AuthContext } from "../context/auth-context";
import { fetchUserWishlist, removeFromWishlist } from "../../api/user";
import { getFlagEmoji } from "../country-search/country-search";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/errorModal/errorModal";
import { geocodeAddress } from "../../api/weather";
import WeatherWidget from "../weather-widget/weather-widget";
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
    geocodeAddress(country.name)
      .then((c) => setCoords({ lat: c.lat, lon: c.lon }))
      .catch(() => {});
  };

  const closeModal = () => {
    setSelectedCountry(null);
    setCoords(null);
  };

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
              <WeatherWidget lat={coords?.lat} lon={coords?.lon} />
              <ClimateChart lat={coords?.lat} lon={coords?.lon} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
