import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

const CountryComments = ({
  country,
  canEdit,
  commentInput,
  setCommentInput,
  commentMutation,
  deleteCommentMutation,
}) => {
  const auth = useContext(AuthContext);

  return (
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
          <span className="country-modal__comment-text">{comment.text}</span>
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
  );
};

export default CountryComments;
