import { useCallback, useState } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState();

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData);
        }
        setIsLoading(false);
        return responseData;
      } catch (err) {
        setIsLoading(false);
        setErr(err.message);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setErr(null);
  };
  return { isLoading, err, sendRequest, clearError };
};
