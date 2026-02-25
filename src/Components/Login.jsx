import { useState } from "react";
import { login } from "../services/api";
import { Navigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/history" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await login(email, password);

      localStorage.setItem("token", response.token);

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-4">
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-800 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-800 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ocean-600 hover:bg-ocean-800 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

        <div className="text-center mt-4">
          <p className="text-sm test-netural-600">
            <Link
             to="/register"
             className="text-ocean-600 hover:text-ocean-800 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: "green", marginTop: "10px" }}>
          Login successful!
        </p>
      )}
    </div>
    </div>
  );
}

