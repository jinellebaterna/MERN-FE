import { useState, useContext } from "react";
import { Trash2 } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../shared/context/auth-context";
import {
  likePlace,
  unlikePlace,
  fetchPlaceById,
  fetchComments,
  addComment,
  deleteComment,
  markVisited,
  unmarkVisited,
  markWantToVisit,
  unmarkWantToVisit,
} from "../../../api/places";
import { geocodeAddress } from "../../../api/weather";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import Card from "../../shared/components/card/card";
import "./place-detail.css";
import WeatherWidget from "../../places/weather-widget/weather-widget";
import ClimateChart from "../../places/climate-chart/climate-chart";

const PlaceDetail = () => {
  const { placeId } = useParams();
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  const {
    data: place,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", placeId],
    queryFn: () => fetchComments(placeId),
  });

  const { data: locationInfo } = useQuery({
    queryKey: ["geocode", place?.address],
    queryFn: () => geocodeAddress(place.address),
    enabled: !!place?.address,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const isLiked = place?.likes?.includes(auth.userId);
  const isVisited = place?.visitedBy?.includes(auth.userId);
  const isWantToVisit = place?.wantToVisitBy?.includes(auth.userId);
  const [commentText, setCommentText] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  const likeMutation = useMutation({
    mutationFn: isLiked ? unlikePlace : likePlace,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["place", placeId] });
      const previous = queryClient.getQueryData(["place", placeId]);
      queryClient.setQueryData(["place", placeId], (old) => ({
        ...old,
        likes: isLiked
          ? old.likes.filter((id) => id !== auth.userId)
          : [...(old.likes || []), auth.userId],
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["place", placeId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });
  const visitedMutation = useMutation({
    mutationFn: isVisited ? unmarkVisited : markVisited,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["place", placeId] });
      const previous = queryClient.getQueryData(["place", placeId]);
      queryClient.setQueryData(["place", placeId], (old) => ({
        ...old,
        visitedBy: isVisited
          ? old.visitedBy.filter((id) => id !== auth.userId)
          : [...(old.visitedBy || []), auth.userId],
        wantToVisitBy: (old.wantToVisitBy || []).filter((id) => id !== auth.userId),
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["place", placeId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });

  const wantToVisitMutation = useMutation({
    mutationFn: isWantToVisit ? unmarkWantToVisit : markWantToVisit,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["place", placeId] });
      const previous = queryClient.getQueryData(["place", placeId]);
      queryClient.setQueryData(["place", placeId], (old) => ({
        ...old,
        wantToVisitBy: isWantToVisit
          ? old.wantToVisitBy.filter((id) => id !== auth.userId)
          : [...(old.wantToVisitBy || []), auth.userId],
        visitedBy: (old.visitedBy || []).filter((id) => id !== auth.userId),
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["place", placeId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["place", placeId] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", placeId] });
      setCommentText("");
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") auth.logout();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", placeId] }),
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") auth.logout();
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !place) return <p>Could not find this place.</p>;

  return (
    <div className="place-details">
      <Card>
        <div className="place-gallery">
          {place.images?.[0] && (
            <img
              className="place-gallery__hero"
              src={`http://localhost:5001/${place.images[0]}`}
              alt={`${place.title} 1`}
              style={{ cursor: "pointer" }}
              onClick={() => setLightboxImage(`http://localhost:5001/${place.images[0]}`)}
            />
          )}
          {place.images?.length > 1 && (
            <div className="place-gallery__thumbnails">
              {place.images.slice(1).map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:5001/${img}`}
                  alt={`${place.title} ${i + 2}`}
                  onClick={() => setLightboxImage(`http://localhost:5001/${img}`)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="place-details-container">
          <div className="place-details-info">
            <h1>{place.title}</h1>
            <p>Address: {place.address}</p>
            {locationInfo?.country && <p>Country: {locationInfo.country}</p>}
            {place.tags?.length > 0 && (
              <div className="place-tags">
                {place.tags.map((tag) => (
                  <span key={tag} className="tag-badge">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p>{place.description}</p>
            {auth.isLoggedIn && (
              <button
                className={`like-btn ${isLiked ? "like-btn--liked" : ""}`}
                onClick={() =>
                  likeMutation.mutate({ placeId, token: auth.token })
                }
                disabled={likeMutation.isPending}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                <span>{place.likes?.length || 0}</span>
              </button>
            )}
            {auth.isLoggedIn && (
              <div className="status-buttons">
                <button
                  className={`status-btn status-btn--visited ${isVisited ? "status-btn--visited--active" : ""}`}
                  onClick={() => visitedMutation.mutate({ placeId, token: auth.token })}
                  disabled={visitedMutation.isPending}
                >
                  ✓ Visited
                </button>
                <button
                  className={`status-btn status-btn--want ${isWantToVisit ? "status-btn--want--active" : ""}`}
                  onClick={() => wantToVisitMutation.mutate({ placeId, token: auth.token })}
                  disabled={wantToVisitMutation.isPending}
                >
                  ♡ Want to Visit
                </button>
              </div>
            )}
          </div>
          <WeatherWidget lat={locationInfo?.lat} lon={locationInfo?.lon} />
        </div>
        <div className="place-climate">
          <ClimateChart lat={locationInfo?.lat} lon={locationInfo?.lon} />
        </div>
        <section className="comments-section">
          <h3>Comments</h3>
          {comments.length === 0 && <p>No comments yet.</p>}
          <ul className="comments-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment-item">
                <div className="comment-meta">
                  <strong>{comment.author.name}</strong>
                  <span>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{comment.text}</p>
                {comment.author.id === auth.userId && (
                  <button
                    className="comment-delete-btn"
                    onClick={() =>
                      deleteCommentMutation.mutate({
                        placeId,
                        commentId: comment.id,
                        token: auth.token,
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {auth.isLoggedIn && (
            <div className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
              />
              <button
                onClick={() =>
                  addCommentMutation.mutate({
                    placeId,
                    text: commentText,
                    token: auth.token,
                  })
                }
                disabled={!commentText.trim() || addCommentMutation.isPending}
              >
                POST
              </button>
            </div>
          )}
        </section>
        {lightboxImage && (
          <div className="image-lightbox" onClick={() => setLightboxImage(null)}>
            <div className="image-lightbox__content" onClick={(e) => e.stopPropagation()}>
              <img src={lightboxImage} alt="Full size" />
              <button className="image-lightbox__close" onClick={() => setLightboxImage(null)}>✕</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlaceDetail;
