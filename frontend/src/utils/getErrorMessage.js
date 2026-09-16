const getErrorMessage = (
  error,
  fallback = "Something went wrong"
) => {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Server took too long to respond.";
    }

    return "Unable to connect to the server.";
  }

  return (
    error.response?.data?.message ||
    fallback
  );
};

export default getErrorMessage;
