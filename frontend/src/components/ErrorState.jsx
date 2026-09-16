import { CircleAlert } from "lucide-react";

const ErrorState = ({
  message = "Something went wrong.",
  onRetry
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <CircleAlert size={40} className="mx-auto text-red-500" />
      <p className="text-red-700 mt-4">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
