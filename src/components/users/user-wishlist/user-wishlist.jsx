import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "../../shared/context/auth-context";
import {
  fetchUserWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../../api/user";
import CountrySearch, { getFlagEmoji } from "../user-countries/CountrySearch";
import LoadingSpinner from "../../shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../../shared/components/errorModal/errorModal";
import { useState } from "react";
import "./user-wishlist.css";

const UserWishlist = () => {
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const viewedUserId = searchParams.get("user") || auth.userId;
  const canEdit = auth.userId === viewedUserId;
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist", viewedUserId],
    queryFn: () => fetchUserWishlist(viewedUserId),
    enabled: !!viewedUserId,
  });

  const addMutation = useMutation({
    mutationFn: ({ name, code }) =>
      addToWishlist({ userId: auth.userId, name, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", auth.userId] }),
    onError: (err) => setError(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (code) =>
      removeFromWishlist({ userId: auth.userId, code, token: auth.token }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wishlist", auth.userId] }),
    onError: (err) => setError(err.message),
  });

  if (isLoading) return <LoadingSpinner asOverlay />;

  return (
    <div className="user-wishlist">
      <ErrorModal error={error} onClear={() => setError(null)} />

      <div className="user-wishlist__header">
        <h2>
          {canEdit ? "My Bucket List" : "Bucket List"}
          <span className="user-wishlist__count">{wishlist.length}</span>
        </h2>
        {canEdit && (
          <CountrySearch
            excludeCodes={wishlist.map((c) => c.code)}
            onSelect={({ name, code }) => addMutation.mutate({ name, code })}
          />
        )}
      </div>

      {wishlist.length === 0 && (
        <div className="user-wishlist__empty">
          {canEdit
            ? "No countries yet. Search above to add countries you want to visit!"
            : "No bucket list countries yet."}
        </div>
      )}

      <div className="user-wishlist__grid">
        {wishlist.map((country) => (
          <div key={country.code} className="wishlist-card">
            <div className="wishlist-card__flag">
              {getFlagEmoji(country.code)}
            </div>
            <div className="wishlist-card__name">{country.name}</div>
            {canEdit && (
              <button
                className="wishlist-card__remove"
                onClick={() => removeMutation.mutate(country.code)}
                disabled={removeMutation.isPending}
                title="Remove"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWishlist;
