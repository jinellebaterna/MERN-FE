import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  reorderWishlist,
  fetchUserWishlist,
  removeFromWishlist,
} from "../../api/user";
import useSortableList from "../../hook/use-sortable-list";

import { AuthContext } from "../context/auth-context";
import { getFlagEmoji } from "../../utils/flags";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/errorModal/errorModal";
import useSortableItem from "../../hook/use-sortable-item";
import useErrorHandler from "../../hook/use-error-handler";
import WishlistModal from "./wishlist-modal";

import "./user-wishlist.css";

const SortableWishlistCard = ({
  country,
  onRemove,
  canEdit,
  isRemoving,
  onClick,
}) => {
  const { setNodeRef, style, attributes, listeners } = useSortableItem(
    country.code,
    canEdit
  );
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
  const { error, setError, clearError } = useErrorHandler();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist", viewedUserId],
    queryFn: () => fetchUserWishlist(viewedUserId),
    enabled: !!viewedUserId && canEdit,
  });

  const [localWishlist, setLocalWishlist] = useState(wishlist);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalWishlist(wishlist), [wishlist]);

  const removeMutation = useMutation({
    mutationFn: (code) =>
      removeFromWishlist({ userId: auth.userId, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", auth.userId] }),
    onError: (err) => setError(err.message),
  });

  const reorderMutation = useMutation({
    mutationFn: reorderWishlist,
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", viewedUserId] }),
  });

  const { sensors, handleDragEnd } = useSortableList({
    items: localWishlist,
    setItems: setLocalWishlist,
    reorderMutation,
  });

  if (isLoading) return <LoadingSpinner asOverlay />;
  if (!canEdit) return null;

  return (
    <div className="user-wishlist">
      <ErrorModal error={error} onClear={clearError} />

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
                onClick={setSelectedCountry}
                onRemove={(code) => removeMutation.mutate(code)}
                canEdit={canEdit}
                isRemoving={removeMutation.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedCountry && (
        <WishlistModal
          country={selectedCountry}
          canEdit={canEdit}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
};

export default UserWishlist;
