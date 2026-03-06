import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../shared/modal/modal";
import Button from "../shared/button/button";
import "./followers-modal.css";

const IMG_BASE = "http://localhost:5001";

const FollowersModal = ({
  show,
  targetUser,
  allUsers,
  loggedInUserData,
  onClose,
  followMutation,
  auth,
  initialTab = "followers",
}) => {
  const [tab, setTab] = useState("followers");
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (show) setTab(initialTab);
  }, [show, initialTab]);

  if (!targetUser) return null;

  const allUsersMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));

  const followerList = (targetUser.followers || [])
    .map((id) => allUsersMap[id])
    .filter(Boolean);

  const followingList = (targetUser.following || [])
    .map((id) => allUsersMap[id])
    .filter(Boolean);

  const list = tab === "followers" ? followerList : followingList;

  const handleRowClick = (userId) => {
    onClose();
    navigate(`/countries?user=${userId}`);
  };

  return (
    <Modal
      show={show}
      onCancel={onClose}
      header={targetUser.name}
      footer={<Button onClick={onClose}>Close</Button>}
      footerClass="followers-modal__footer"
    >
      <div className="followers-modal__tabs">
        <button
          className={`followers-modal__tab${tab === "followers" ? " followers-modal__tab--active" : ""}`}
          onClick={() => setTab("followers")}
        >
          Followers ({followerList.length})
        </button>
        <button
          className={`followers-modal__tab${tab === "following" ? " followers-modal__tab--active" : ""}`}
          onClick={() => setTab("following")}
        >
          Following ({followingList.length})
        </button>
      </div>

      {list.length === 0 ? (
        <p className="followers-modal__empty">Nobody here yet.</p>
      ) : (
        <ul className="followers-modal__list">
          {list.map((listedUser) => {
            const isFollowingThem = listedUser.followers?.includes(auth.userId);
            const theyFollowMe = loggedInUserData?.followers?.includes(
              listedUser.id
            );
            const label = isFollowingThem
              ? "Unfollow"
              : theyFollowMe
                ? "Follow Back"
                : "Follow";
            const isMe = listedUser.id === auth.userId;

            return (
              <li key={listedUser.id} className="followers-modal__row">
                <img
                  className="followers-modal__avatar"
                  src={`${IMG_BASE}/${listedUser.image}`}
                  alt={listedUser.name}
                  onClick={() => handleRowClick(listedUser.id)}
                />
                <div
                  className="followers-modal__info"
                  onClick={() => handleRowClick(listedUser.id)}
                >
                  <span className="followers-modal__name">
                    {listedUser.name}
                  </span>
                  <span className="followers-modal__meta">
                    {listedUser.countries?.length || 0} countries
                  </span>
                </div>
                {!isMe && (
                  <button
                    className={`followers-modal__action${isFollowingThem ? " followers-modal__action--unfollow" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      followMutation.mutate({
                        userId: listedUser.id,
                        isFollowing: isFollowingThem,
                      });
                    }}
                    disabled={followMutation.isPending}
                  >
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
};

export default FollowersModal;
