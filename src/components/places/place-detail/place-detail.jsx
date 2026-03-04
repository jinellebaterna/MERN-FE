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
} from "../../../api/places";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import Card from "../../shared/components/card/card";
import "./place-detail.css";

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

  const isLiked = place?.likes?.includes(auth.userId);
  const [commentText, setCommentText] = useState("");

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
        <div className="place-details-container">
          <img src={`http://localhost:5001/${place.image}`} alt={place.title} />
          <div className="place-details-info ">
            <h1>{place.title}</h1>
            <p>Address: {place.address}</p>
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
          </div>
        </div>
      </Card>
      <section className="comments-section">
        <h3>Comments</h3>
        {comments.length === 0 && <p>No comments yet.</p>}
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-meta">
                <strong>{comment.author.name}</strong>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
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
    </div>
  );
};

export default PlaceDetail;
