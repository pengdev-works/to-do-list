// client/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../api.js"; // centralized axios withCredentials

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [loading, setLoading] = useState(false);

  // ===== Redirect if session exists =====
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await API.get("/get-session");
        if (res.data.session) navigate("/home");
      } catch (err) {
        console.log("Session check failed:", err.message);
      }
    };
    checkSession();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
    setType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setType("error");
      setMessage("Both fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/login", {
        username: form.username,
        password: form.password,
      });

      if (res.data.success) {
        setType("success");
        setMessage("Logged in successfully! Redirecting...");
        setForm({ username: "", password: "" });
        navigate("/home"); // session cookie is already set
      } else {
        setType("error");
        setMessage(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setType("error");
      setMessage(
        err.response?.data?.message ||
          "Cannot connect to server. Check backend CORS and cookie settings"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Login</h2>

        {message && (
          <div
            className={`mb-4 text-sm text-center rounded-lg py-2 font-medium ${
              type === "success"
                ? "bg-green-900 text-green-400"
                : "bg-red-900 text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-300 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
