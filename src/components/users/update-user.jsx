import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "../../components/shared/components/input/input";
import Button from "../../components/shared/components/button/button";
import LoadingSpinner from "../../components/shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../../components/shared/components/errorModal/errorModal";
import "../places/place-form.css";
import { VALIDATOR_REQUIRE } from "../shared/utils/validators";
import { useForm } from "../shared/hook/form-hook";
import { AuthContext } from "../shared/context/auth-context";
import { fetchUserById, updateUser } from "../../api/user";

const UpdateUser = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(null);

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
      {updateMutation.isPending && <LoadingSpinner asOverlay />}
      <form className="place-form" onSubmit={submitHandler}>
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
    </>
  );
};

export default UpdateUser;
