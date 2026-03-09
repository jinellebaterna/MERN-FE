import { useState, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import Card from "../shared/card/card";
import Input from "../shared/input/input";
import Button from "../shared/button/button";
import ImageUpload from "../shared/imageUpload/imageUpload";
import ErrorModal from "../shared/errorModal/errorModal";
import LoadingSpinner from "../shared/loadingSpinner/loadingSpinner";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../utils/validators";
import { useForm } from "../../hook/form-hook";
import { AuthContext } from "../context/auth-context";
import { loginUser, signupUser } from "../../api/auth";
import "./auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      auth.login(data.userId, data.token, null, data.name, data.image);
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      auth.login(data.userId, data.token, null, data.name, data.image);
    },
  });

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: true,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      loginMutation.mutate({
        email: formState.inputs.email.value,
        password: formState.inputs.password.value,
      });
    } else {
      signupMutation.mutate({
        name: formState.inputs.name.value,
        email: formState.inputs.email.value,
        password: formState.inputs.password.value,
        image: formState.inputs.image.value,
      });
    }
  };

  const currentMutation = isLoginMode ? loginMutation : signupMutation;

  return (
    <>
      <ErrorModal
        error={currentMutation.error?.message}
        onClear={() => currentMutation.reset()}
      />
      <Card className="authentication">
        {currentMutation.isPending && <LoadingSpinner asOverlay />}
        <form onSubmit={authSubmitHandler}>
          <div>
            <h2>{isLoginMode ? "Welcome Back!" : "Create an Account"}</h2>
            <p>
              {isLoginMode
                ? "Login to continue."
                : "Sign up to start sharing places."}
            </p>
          </div>
          {!isLoginMode && (
            <>
              <ImageUpload
                avatar
                center
                id="image"
                onInput={inputHandler}
                errorText="Please provide an image."
              />
              <Input
                element="input"
                id="name"
                type="text"
                label="Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a name."
                onInput={inputHandler}
              />
            </>
          )}
          <Input
            element="input"
            id="email"
            type="email"
            label="Email Address"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
        </Button>
      </Card>
    </>
  );
};

export default Auth;
