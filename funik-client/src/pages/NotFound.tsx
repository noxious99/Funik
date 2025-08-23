import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page not found.</p>
      <Link
        to="/"
        className="bg-primary px-6 py-3 rounded hover:bg-secondary transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
