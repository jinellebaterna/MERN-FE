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

import { AuthContext } from "../context/auth-context";
import {
  fetchUserCountries,
  fetchUserById,
  addUserCountry,
  fetchUserWishlist,
  addToWishlist,
  reorderCountries,
} from "../../api/user";
import { getFlagEmoji } from "../../utils/flags";
import CountrySearch from "../country-search/country-search";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/errorModal/errorModal";
import ContinentStats from "../continent-stats/continent-stats";
import CountryModal from "./country-modal";
import { COUNTRIES } from "../../data/data";
import "./user-countries.css";

const SortableCountryCard = ({ country, onClick, canEdit }) => {
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
    cursor: canEdit ? "grab" : "pointer",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canEdit ? listeners : {})}
      className="country-card"
      onClick={() => onClick(country)}
    >
      <div className="country-card__flag">{getFlagEmoji(country.code)}</div>
      <div className="country-card__name">{country.name}</div>
    </div>
  );
};

const UserCountries = () => {
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const viewedUserId = searchParams.get("user") || auth.userId;
  const canEdit = auth.userId === viewedUserId;
  const queryClient = useQueryClient();

  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [pendingCountry, setPendingCountry] = useState(null);

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

  const [localCountries, setLocalCountries] = useState(countries);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalCountries(countries), [countries]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const reorderMutation = useMutation({
    mutationFn: reorderCountries,
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["countries", viewedUserId] }),
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localCountries.findIndex((c) => c.code === active.id);
    const newIndex = localCountries.findIndex((c) => c.code === over.id);
    const reordered = arrayMove(localCountries, oldIndex, newIndex);
    setLocalCountries(reordered);
    reorderMutation.mutate({
      userId: auth.userId,
      codes: reordered.map((c) => c.code),
      token: auth.token,
    });
  };

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

  const handleContinentSelect = (continent) => {
    setSelectedContinent((prev) => (prev === continent ? null : continent));
  };

  const displayedCountries = selectedContinent
    ? localCountries.filter((c) => {
        const found = COUNTRIES.find((a) => a.code === c.code);
        return found?.continent === selectedContinent;
      })
    : localCountries;

  if (isLoading) return <LoadingSpinner asOverlay />;

  return (
    <div className="user-countries">
      <ErrorModal error={error} onClear={() => setError(null)} />
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

      <ContinentStats
        countries={countries}
        selectedContinent={selectedContinent}
        onSelect={handleContinentSelect}
      />
      {countries.length > 0 &&
        selectedContinent &&
        displayedCountries.length === 0 && (
          <div className="user-countries__empty">
            No countries visited in {selectedContinent} yet.
          </div>
        )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={canEdit ? handleDragEnd : undefined}
      >
        <SortableContext
          items={localCountries.map((c) => c.code)}
          strategy={rectSortingStrategy}
        >
          <div className="user-countries__grid">
            {displayedCountries.map((country) => (
              <SortableCountryCard
                key={country.code}
                country={country}
                onClick={setSelectedCountry}
                canEdit={canEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedCountry && (
        <CountryModal
          country={selectedCountry}
          canEdit={canEdit}
          viewedUserId={viewedUserId}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
};

export default UserCountries;
