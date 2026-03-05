import { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "../shared/components/input/input";
import Button from "../shared/components/button/button";
import Card from "../shared/components/card/card";
import LoadingSpinner from "../shared/components/loadingSpinner/loadingSpinner";
import ErrorModal from "../shared/components/errorModal/errorModal";
import ImageUpload from "../shared/components/imageUpload/imageUpload";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../shared/utils/validators";
import { useForm } from "../shared/hook/form-hook";
import { useImageUpload } from "../shared/hook/use-image-upload";
import { AuthContext } from "../shared/context/auth-context";
import { fetchPlaceById, updatePlace } from "../../api/places";
import "./place-form.css";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const placeId = useParams().placeId;

  const [tagsInput, setTagsInput] = useState("");
  const [removeImages, setRemoveImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const { imageInputHandler, isUploading, uploadError, clearUploadError } = useImageUpload(
    (id, paths) => setNewImages(paths)
  );

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const {
    data: place,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId),
  });

  const updateMutation = useMutation({
    mutationFn: updatePlace,
    onSuccess: () => {
      queryClient.invalidateQueries(["places", auth.userId]);
      queryClient.invalidateQueries(["place", placeId]);
      navigate(`/${auth.userId}/places`);
    },
    onError: (error) => {
      if (error.message === "UNAUTHORIZED") {
        auth.logout();
      }
    },
  });

  useEffect(() => {
    if (place) {
      setFormData(
        {
          title: {
            value: place.title,
            isValid: true,
          },
          description: {
            value: place.description,
            isValid: true,
          },
        },
        true
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTagsInput(place.tags?.join(", ") ?? "");
    }
  }, [setFormData, place]);

  const placeUpdateSubmitHandler = (event) => {
    event.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    updateMutation.mutate({
      placeId,
      placeData: {
        title: formState.inputs.title.value,
        description: formState.inputs.description.value,
        tags,
        newImages,
        removeImages,
      },
      token: auth.token,
    });
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!place && !isLoading) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ErrorModal
        error={uploadError || error?.message || updateMutation.error?.message}
        onClear={() => { clearUploadError(); updateMutation.reset(); }}
      />
      {(updateMutation.isPending || isUploading) && <LoadingSpinner asOverlay />}
      <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
          initialValue={formState.inputs.title.value}
          initialValid={formState.inputs.title.isValid}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (min. 5 characters)."
          onInput={inputHandler}
          initialValue={formState.inputs.description.value}
          initialValid={formState.inputs.description.isValid}
        />
        <div className="existing-images">
          {place.images
            ?.filter((img) => !removeImages.includes(img))
            .map((img, i) => (
              <div key={i} className="existing-image">
                <img
                  src={`http://localhost:5001/${img}`}
                  alt={`image ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setRemoveImages((prev) => [...prev, img])}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <ImageUpload
          id="newImages"
          multiple
          onInput={imageInputHandler}
          errorText=""
        />
        <div className="place-form__field">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g. café, paris"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
        <div className="place-form__actions">
          <Button
            type="button"
            inverse
            onClick={() => navigate(`/${auth.userId}/places`)}
          >
            CANCEL
          </Button>
          <Button type="submit" disabled={!formState.isValid || isUploading}>
            UPDATE PLACE
          </Button>
        </div>
      </form>
    </>
  );
};

export default UpdatePlace;
