import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "./shared/components/input/input";
import Button from "./shared/components/button/button";
import ErrorModal from "./shared/components/errorModal/errorModal";
import LoadingSpinner from "./shared/components/loadingSpinner/loadingSpinner";
import ImageUpload from "./shared/components/imageUpload/imageUpload";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "./shared/utils/validators";
import { useForm } from "./shared/hook/form-hook";
import { useImageUpload } from "./shared/hook/use-image-upload";
import { AuthContext } from "../shared/context/auth-context";
import { createPlace } from "../api/places";
import "./place-form.css";

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      images: { value: [], isValid: false },
    },
    false
  );
  const [tagsInput, setTagsInput] = useState("");
  const {
    imageInputHandler,
    isUploading,
    uploadingKeys,
    uploadProgress,
    uploadError,
    clearUploadError,
  } = useImageUpload(inputHandler);

  const mutation = useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      // Invalidate places query to refetch
      queryClient.invalidateQueries(["places", auth.userId]);
      navigate(`/${auth.userId}/places`);
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        auth.logout();
      }
    },
  });

  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    mutation.mutate({
      placeData: {
        title: formState.inputs.title.value,
        description: formState.inputs.description.value,
        address: formState.inputs.address.value,
        creator: auth.userId,
        images: formState.inputs.images.value, // already uploaded paths
        tags: tags,
      },
      token: auth.token,
    });
  };

  return (
    <>
      <ErrorModal
        error={uploadError || mutation.error?.message}
        onClear={() => {
          clearUploadError();
          mutation.reset();
        }}
      />
      {mutation.isPending && <LoadingSpinner asOverlay />}
      <form className="place-form" onSubmit={placeSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />
        <ImageUpload
          id="images"
          multiple
          onInput={imageInputHandler}
          errorText="Please provide at least one image"
          uploadingKeys={uploadingKeys}
        />
        {uploadProgress !== null && (
          <div className="upload-progress">
            <div className="upload-progress__bar-track">
              <div
                className="upload-progress__bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="upload-progress__label">
              Uploading... {uploadProgress}%
            </span>
          </div>
        )}
        <div className="place-form__field">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g. café, paris"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!formState.isValid || isUploading}>
          ADD PLACE
        </Button>
      </form>
    </>
  );
};

export default NewPlace;
