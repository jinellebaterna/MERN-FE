import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/auth-context";
import { ThemeContext } from "../context/theme-context";
import {
  fetchUserById,
  fetchUserCountries,
  fetchUserWishlist,
  fetchAllUsers,
  updateUser,
  changePassword,
  deleteUser,
} from "../../api/user";
import { COUNTRIES } from "../../data/data";
import { useAuthMutation } from "../../hook/use-auth-mutation";
import useFollowMutation from "../../hook/use-follow-mutation";
import { useForm } from "../../hook/form-hook";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from "../../utils/validators";
import Avatar from "../shared/avatar/avatar";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/errorModal/errorModal";
import Input from "../shared/input/input";
import Button from "../shared/button/button";
import Modal from "../shared/modal/modal";
import "./profile.css";

const Profile = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [tab, setTab] = useState("overview");
  const [followersTab, setFollowersTab] = useState("followers");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccessMsg, setPwSuccessMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passportDraft, setPassportDraft] = useState(auth.passportCountry || "");

  const [formState, inputHandler, setFormData] = useForm(
    { name: { value: "", isValid: false } },
    false
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", auth.userId],
    queryFn: () => fetchUserById(auth.userId),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries", auth.userId],
    queryFn: () => fetchUserCountries(auth.userId),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist", auth.userId],
    queryFn: () => fetchUserWishlist(auth.userId),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: { value: user.name, isValid: true } }, true);
    }
  }, [user, setFormData]);

  const followMutation = useFollowMutation();

  const updateMutation = useAuthMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      auth.updateProfile(data.user.name, data.user.image, data.user.passportCountry);
      queryClient.invalidateQueries(["user", auth.userId]);
    },
  });

  const changePasswordMutation = useAuthMutation({
    mutationFn: changePassword,
    onSuccess: () => setPwSuccessMsg("Password changed!"),
  });

  const deleteUserMutation = useAuthMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      auth.logout();
      navigate("/");
    },
  });

  if (isLoading) return <LoadingSpinner asOverlay />;

  const allUsersMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));
  const followerList = (user?.followers || [])
    .map((id) => allUsersMap[id])
    .filter(Boolean);
  const followingList = (user?.following || [])
    .map((id) => allUsersMap[id])
    .filter(Boolean);
  const displayList =
    followersTab === "followers" ? followerList : followingList;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="profile-page">
      <ErrorModal
        error={updateMutation.error?.message}
        onClear={() => updateMutation.reset()}
      />
      <ErrorModal
        error={changePasswordMutation.error?.message}
        onClear={() => changePasswordMutation.reset()}
      />
      <ErrorModal
        error={deleteUserMutation.error?.message}
        onClear={() => deleteUserMutation.reset()}
      />
      {updateMutation.isPending && <LoadingSpinner asOverlay />}

      <div className="profile-page__tabs">
        <button
          className={`profile-page__tab${tab === "overview" ? " profile-page__tab--active" : ""}`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={`profile-page__tab${tab === "settings" ? " profile-page__tab--active" : ""}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </div>

      {tab === "overview" && (
        <div className="profile-overview">
          <div className="profile-header">
            <h2 className="profile-header__name">{auth.name}</h2>
            {memberSince && (
              <span className="profile-header__since">
                Member since {memberSince}
              </span>
            )}
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat__count">{countries.length}</span>
              <span className="profile-stat__label">Countries</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__count">{wishlist.length}</span>
              <span className="profile-stat__label">Wishlist</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__count">{followerList.length}</span>
              <span className="profile-stat__label">Followers</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__count">
                {followingList.length}
              </span>
              <span className="profile-stat__label">Following</span>
            </div>
          </div>

          <div className="profile-followers">
            <div className="profile-followers__tabs">
              <button
                className={`profile-followers__tab${followersTab === "followers" ? " profile-followers__tab--active" : ""}`}
                onClick={() => setFollowersTab("followers")}
              >
                Followers ({followerList.length})
              </button>
              <button
                className={`profile-followers__tab${followersTab === "following" ? " profile-followers__tab--active" : ""}`}
                onClick={() => setFollowersTab("following")}
              >
                Following ({followingList.length})
              </button>
            </div>

            {displayList.length === 0 ? (
              <p className="profile-followers__empty">Nobody here yet.</p>
            ) : (
              <ul className="profile-followers__list">
                {displayList.map((u) => {
                  const isFollowing = u.followers?.includes(auth.userId);
                  const theyFollowMe = user?.followers?.includes(u.id);
                  const label = isFollowing
                    ? "Unfollow"
                    : theyFollowMe
                      ? "Follow Back"
                      : "Follow";
                  return (
                    <li key={u.id} className="profile-followers__row">
                      <Avatar
                        image={u.image}
                        name={u.name}
                        size={40}
                        onClick={() => navigate(`/countries?user=${u.id}`)}
                      />
                      <div
                        className="profile-followers__info"
                        onClick={() => navigate(`/countries?user=${u.id}`)}
                      >
                        <span className="profile-followers__name">
                          {u.name}
                        </span>
                        <span className="profile-followers__meta">
                          {u.countries?.length || 0} countries
                        </span>
                      </div>
                      <button
                        className={`profile-followers__action${isFollowing ? " profile-followers__action--unfollow" : ""}`}
                        onClick={() =>
                          followMutation.mutate({ userId: u.id, isFollowing })
                        }
                        disabled={followMutation.isPending}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="profile-settings">
          <h3 className="profile-settings__heading">Edit Profile</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate({
                userId: auth.userId,
                userData: {
                  name: formState.inputs.name.value,
                  image: selectedImage,
                  passportCountry: passportDraft || null,
                },
                token: auth.token,
              });
            }}
          >
            <div className="profile-settings__avatar-row">
              <Avatar image={auth.image} name={auth.name} size={88} />
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
            </div>
            <Input
              id="name"
              element="input"
              type="text"
              label="Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid name."
              onInput={inputHandler}
              initialValue={formState.inputs.name.value}
              initialValid={formState.inputs.name.isValid}
            />
            <div className="profile-settings__passport">
              <label className="profile-settings__passport-label">🛂 Passport Country</label>
              <select
                className="profile-settings__passport-select"
                value={passportDraft}
                onChange={(e) => setPassportDraft(e.target.value)}
              >
                <option value="">— Not set —</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <span className="profile-settings__passport-hint">Used to show visa requirements on your wishlist.</span>
            </div>
            <Button
              type="submit"
              disabled={!formState.isValid || updateMutation.isPending}
            >
              {updateMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </form>

          <hr className="profile-settings__divider" />

          <h3 className="profile-settings__heading">Change Password</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPwSuccessMsg("");
              if (newPassword.length < 6) return;
              changePasswordMutation.mutate({
                userId: auth.userId,
                currentPassword,
                newPassword,
                token: auth.token,
              });
            }}
          >
            <Input
              id="currentPassword"
              element="input"
              type="password"
              label="Current Password"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter your current password."
              onInput={(id, value) => setCurrentPassword(value)}
            />
            <Input
              id="newPassword"
              element="input"
              type="password"
              label="New Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="New password must be at least 6 characters."
              onInput={(id, value) => setNewPassword(value)}
            />
            {pwSuccessMsg && (
              <p className="profile-settings__success">{pwSuccessMsg}</p>
            )}
            <Button
              type="submit"
              disabled={!currentPassword || newPassword.length < 6}
            >
              CHANGE PASSWORD
            </Button>
          </form>

          <hr className="profile-settings__divider" />

          <h3 className="profile-settings__heading">Appearance</h3>
          <div className="profile-settings__theme-row">
            <span>Theme</span>
            <button
              className="profile-settings__theme-btn"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙 Dark" : "☀️  Light"}
            </button>
          </div>

          <hr className="profile-settings__divider" />

          <h3 className="profile-settings__heading">Danger Zone</h3>
          <Button inverse onClick={() => setShowDeleteModal(true)}>
            DELETE ACCOUNT
          </Button>

          <Modal
            show={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            header="Delete Account"
            footer={
              <div className="profile-settings__delete">
                <Button inverse onClick={() => setShowDeleteModal(false)}>
                  CANCEL
                </Button>
                <Button
                  danger
                  onClick={() =>
                    deleteUserMutation.mutate({
                      userId: auth.userId,
                      token: auth.token,
                    })
                  }
                  disabled={deleteUserMutation.isPending}
                >
                  CONFIRM DELETE
                </Button>
              </div>
            }
          >
            <p>Are you sure? This cannot be undone.</p>
          </Modal>

          <hr className="profile-settings__divider" />

          <Button
            inverse
            onClick={() => {
              auth.logout();
              navigate("/");
            }}
          >
            LOGOUT
          </Button>
        </div>
      )}
    </div>
  );
};
export default Profile;
