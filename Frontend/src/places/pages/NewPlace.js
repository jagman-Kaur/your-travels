import React, { Fragment, useContext } from "react";
import Input from "../../shared/components/form-elements/Input";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/components/utils/Validators";
import Button from "../../shared/components/form-elements/Button";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/Auth-context";
import { useHistory } from "react-router-dom";

import "./PlaceForm.css";
import ImageUpload from "../../shared/components/form-elements/ImageUpload";

function NewPlace() {
  const { isLoading, err, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const history = useHistory();
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
      image: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      formData.append("image", formState.inputs.image.value);

      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/api/places",
        "POST",
        formData,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
    } catch (err) {}
    history.push("/");
  };

  return (
    <Fragment>
      <ErrorModal error={err} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      {!isLoading && (
        <form className="place-form" onSubmit={submitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            error="Please enter a valid title"
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            error="Please enter a valid description (at least 5 characters)"
            validators={[VALIDATOR_MINLENGTH(5)]}
            onInput={inputHandler}
          />
          <Input
            id="address"
            element="input"
            label="Address"
            error="Please enter a valid address"
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
          />
          <ImageUpload
            center
            id="image"
            onInput={inputHandler}
            errorText="Please provide and image"
          />
          <div className="center">
            <Button type="submit" disabled={!formState.isValid}>
              ADD PLACE
            </Button>
          </div>
        </form>
      )}
    </Fragment>
  );
}

export default NewPlace;
