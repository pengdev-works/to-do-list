import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    // Frontend validation
    if (password !== confirm) {
      setType("error");
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Send all fields including confirm
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        { name, username, password, confirm },
        { withCredentials: true } // important if backend uses sessions
      );

      if (response.data.success) {
        setType("success");
        setMessage("Account created successfully!");

        // Redirect to login after short delay
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setType("error");
        setMessage(response.data.message || "Registration failed");
      }
    } catch (error) {
      setType("error");
      setMessage(
        error.response?.data?.message || "Server error during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-black px-4">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          REGISTER
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

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
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
              ${loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Register;
