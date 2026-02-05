import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function App() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { username, password },
        { withCredentials: true } // important if using sessions
      );

      if (response.data.success) {
        setType("success");
        setMessage("Login successful!");

        // Save auth data (adjust based on backend)
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // Redirect after short delay
        setTimeout(() => {
          navigate("/home");
        }, 800);
      } else {
        setType("error");
        setMessage(response.data.message || "Login failed");
      }
    } catch (error) {
      setType("error");
      setMessage(
        error.response?.data?.message ||
        "Username or password is incorrect"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-black px-4">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          LOGIN
        </h1>

        {message && (
          <div
            className={`mb-4 text-sm text-center rounded-md py-2 ${
              type === "success"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold transition active:scale-95
              ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default App;
