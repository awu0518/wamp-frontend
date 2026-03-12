import { useState } from "react";
import { register } from "../services/api";
import { Navigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // const token = localStorage.getItem("token");

  const tokenRaw = localStorage.getItem("token");
  const token =
    tokenRaw && tokenRaw !== "undefined" && tokenRaw !== "null" ? tokenRaw : null;

  if (token) {
    return <Navigate to="/history" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await register(email, username, password);
      localStorage.setItem("token", response.token);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Must be 3 to 30 characters.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              At least 8 characters, including 1 uppercase letter.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ocean-600 hover:bg-ocean-800 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {error && (
          <p className="text-red-600 mt-4 text-center">
            {error}
          </p>
        )}

        <div className="w-full flex justify-center mt-4">
          <p className="text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-ocean-600 hover:text-ocean-800 font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
