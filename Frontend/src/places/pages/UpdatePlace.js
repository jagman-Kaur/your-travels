import React, { Fragment, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import Button from "../../shared/components/form-elements/Button";
import Input from "../../shared/components/form-elements/Input";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/components/utils/Validators";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Card from "../../shared/components/UIElements/Card";

import "./PlaceForm.css";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/Auth-context";

const UpdatePlace = () => {
  const placeId = useParams().placeId;
  const { isLoading, err, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const history = useHistory();
  const auth = useContext(AuthContext);

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: { value: "", isValid: false },

      description: { value: "", isValid: false },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        let responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/api/places/" + placeId
        );
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: { value: responseData.place.title, isValid: true },

            description: {
              value: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch {}
    };

    fetchPlace();
  }, [setFormData, placeId, sendRequest]);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/api/places/" + placeId,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/" + auth.userId + "/places");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  if (!loadedPlace && !err) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <Fragment>
      <ErrorModal error={err} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={submitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title"
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (atleast 5 characters)  "
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </Fragment>
  );
};

export default UpdatePlace;
