import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../api/api.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [loading, setLoading] = useState(false);

  // Redirect if session exists
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

    if (!form.name || !form.username || !form.password || !form.confirmPassword) {
      setType("error");
      setMessage("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setType("error");
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(
        "/register",
        { name: form.name, username: form.username, password: form.password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setType("success");
        setMessage("Registered successfully! Redirecting...");
        setForm({ name: "", username: "", password: "", confirmPassword: "" });
        setTimeout(() => navigate("/"), 1000);
      } else {
        setType("error");
        setMessage(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register Error:", err);
      setType("error");
      setMessage(err.response?.data?.message || "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-950 px-4">
      <div className="w-full max-w-md p-10 rounded-2xl bg-white/5 backdrop-blur-lg shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-pulse">
          Create Account
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
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transform transition duration-300 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-green-400 hover:text-green-500 hover:underline transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
