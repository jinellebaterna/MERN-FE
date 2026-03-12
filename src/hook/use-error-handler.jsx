import { useState } from "react";

const useErrorHandler = () => {
  const [error, setError] = useState(null);
  return {
    error,
    setError,
    clearError: () => setError(null),
  };
};

export default useErrorHandler;
