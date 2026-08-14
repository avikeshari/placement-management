import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-7xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold mt-4">
        Page not found
      </h2>
      <p className="text-slate-500 mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Return Home
      </Link>
    </div>
  </div>
);

export default NotFound;
