import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../api/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [loading, setLoading] = useState(false);

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
        navigate("/home");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-950 px-4">
      <div className="w-full max-w-md p-10 rounded-2xl bg-white/5 backdrop-blur-lg shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
          Welcome Back
        </h2>

        {message && (
          <div
            className={`mb-4 text-sm text-center rounded-lg py-2 font-medium ${
              type === "success"
                ? "bg-green-700 text-green-100"
                : "bg-red-700 text-red-100"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transform transition duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-500 hover:underline transition">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
