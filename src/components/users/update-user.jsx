import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "../../components/shared/components/input/input";
import Button from "../../components/shared/components/button/button";
import LoadingSpinner from "../../components/shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../../components/shared/components/errorModal/errorModal";
import "../places/place-form.css";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../shared/utils/validators";
import { useForm } from "../shared/hook/form-hook";
import { AuthContext } from "../shared/context/auth-context";
import {
  fetchUserById,
  updateUser,
  changePassword,
  deleteUser,
} from "../../api/user";
import Modal from "../../components/shared/components/modal/modal";

const UpdateUser = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccessMsg, setPwSuccessMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formState, inputHandler, setFormData] = useForm(
    { name: { value: "", isValid: false } },
    false
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", auth.userId],
    queryFn: () => fetchUserById(auth.userId),
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: { value: user.name, isValid: true } }, true);
    }
  }, [user, setFormData]);

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["user", auth.userId]);
      navigate(`/users/${auth.userId}`);
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") auth.logout();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => setPwSuccessMsg("Password changed!"),
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") auth.logout();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      auth.logout();
      navigate("/");
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") auth.logout();
    },
  });

  const submitHandler = (event) => {
    event.preventDefault();
    updateMutation.mutate({
      userId: auth.userId,
      userData: {
        name: formState.inputs.name.value,
        image: selectedImage,
      },
      token: auth.token,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
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

      <div className="place-form">
        <h3>Edit Profile</h3>
        <form onSubmit={submitHandler}>
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
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PROFILE
          </Button>
        </form>

        <hr />

        <h3>Change Password</h3>
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
          {pwSuccessMsg && <p>{pwSuccessMsg}</p>}
          <Button
            type="submit"
            disabled={!currentPassword || newPassword.length < 6}
          >
            CHANGE PASSWORD
          </Button>
        </form>

        <hr />

        <Button inverse onClick={() => setShowDeleteModal(true)}>
          DELETE ACCOUNT
        </Button>
      </div>

      <Modal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        header="Delete Account"
        footer={
          <>
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
          </>
        }
      >
        <p>Are you sure? This cannot be undone.</p>
      </Modal>
    </>
  );
};

export default UpdateUser;
