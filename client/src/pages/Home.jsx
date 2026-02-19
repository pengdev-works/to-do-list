import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2, LogOut, Layout, ListChecks, Loader2 } from "lucide-react";
import Header from "../components/Header.jsx";

export default function Home() {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ======================
  // SESSION CHECK
  // ======================
  const checkSession = async () => {
    try {
      const res = await axios.get(`${API}/get-session`, { withCredentials: true });
      if (!res.data.session) {
        navigate("/home"); // redirect to login if no session
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      navigate("/home");
      return false;
    } finally {
      setLoadingSession(false);
    }
  };

  // ======================
  // FETCH LISTS
  // ======================
  const fetchLists = async () => {
    try {
      const res = await axios.get(`${API}/get-list`, { withCredentials: true });
      if (res.data.success) {
        setLists(res.data.list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const sessionOk = await checkSession();
      if (sessionOk) fetchLists();
    };
    init();
  }, []);

  // ======================
  // ADD LIST
  // ======================
  const addList = async () => {
    if (!title.trim()) return;

    try {
      const res = await axios.post(
        `${API}/add-list`,
        { listTitle: title },
        { withCredentials: true }
      );

      if (res.data.success && res.data.list) {
        // Add new list to the top of the grid
        setLists((prev) => [res.data.list, ...prev]);
        setTitle(""); // Clear input
        inputRef.current.focus(); // Focus input again
      } else {
        alert(res.data.message || "Failed to add list");
      }
    } catch (err) {
      console.error("Add list error:", err);
      alert("Error adding list. Check console for details.");
    }
  };

  // ======================
  // DELETE LIST
  // ======================
  const deleteList = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this list?")) return;

    try {
      await axios.post(`${API}/delete-list/${id}`, {}, { withCredentials: true });
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    try {
      await axios.get(`${API}/logout`, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingSession)
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Authenticating...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 selection:bg-green-500/30">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <Header />

      <main className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-5 h-5 text-green-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
                Workspace
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              My{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                Collections
              </span>
            </h1>
          </div>
          <button
            onClick={logout}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300"
          >
            <span className="text-sm font-medium group-hover:text-red-400">Sign Out</span>
            <LogOut className="w-4 h-4 group-hover:text-red-400" />
          </button>
        </div>

        {/* Input Area */}
        <div className="mb-12 group">
          <div className="relative flex items-center p-1 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl focus-within:border-green-500/50 focus-within:ring-4 focus-within:ring-green-500/10 transition-all duration-300">
            <input
              ref={inputRef}
              type="text"
              placeholder="Start a new list title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && addList()}
            />
            <button
              onClick={addList}
              disabled={!title.trim()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500 px-6 py-3 rounded-xl text-black font-bold transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lists.length === 0 ? (
            <div className="col-span-full py-20 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center">
              <ListChecks className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-gray-500 font-medium text-lg">Your workspace is empty</p>
              <p className="text-gray-600 text-sm">Add your first list to get started.</p>
            </div>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                onClick={() => navigate(`/list/${list.id}`)}
                className="group relative p-6 rounded-2xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-sm hover:border-green-500/30 hover:bg-gray-800/40 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-100 group-hover:text-green-400 transition-colors">
                      {list.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          list.status === "active" ? "bg-green-500" : "bg-gray-600"
                        }`}
                      />
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                        {list.status || "Pending"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteList(e, list.id)}
                    className="p-2 rounded-lg bg-gray-950 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
