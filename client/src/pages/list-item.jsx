import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";
import Header from "../components/Header.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function List() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all items for this list
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/get-items/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setItems(data.items || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Fetch the list title
  const fetchListTitle = async () => {
    try {
      const res = await fetch(`${API}/get-list/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setListTitle(data.list.title);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchListTitle();
    fetchItems();
  }, [id]);

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const res = await fetch(`${API}/add-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listId: id, description: newItem }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => [...prev, data.item]);
        setNewItem("");
      } else {
        alert(data.message || "Failed to add item");
      }
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (e, itemId) => {
    e.stopPropagation(); // prevent card click
    if (!confirm("Remove this item?")) return;
    try {
      await fetch(`${API}/delete-item/${itemId}`, { method: "POST", credentials: "include" });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "pending" ? "completed" : "pending";
    try {
      const res = await fetch(`${API}/update-item/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100">
      <Header />
      <main className="relative z-10 p-6 max-w-2xl mx-auto">
        {/* Back Button & Title */}
        <div className="mb-8 flex flex-col gap-2">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-black text-white">{listTitle || "Loading..."}</h1>
          <span className="text-xs text-gray-400">{items.length} Items</span>
        </div>

        {/* Input Section with Floating Button */}
        <div className="mb-10 relative">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="What needs to be done?"
            className="w-full px-6 py-4 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 pr-16"
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-green-500 hover:bg-green-400 disabled:opacity-50 px-4 py-2 rounded-xl text-black font-bold transition"
          >
            <Plus className="w-5 h-5 inline-block" />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
              <p className="text-gray-500">No tasks in this list yet.</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  item.status === "completed" ? "bg-gray-900/20 border-gray-800/40 opacity-60" : "bg-gray-900/40 border-gray-800 hover:border-gray-700 hover:bg-gray-800/40 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleStatus(item)}
                  className={`${item.status === "completed" ? "text-green-500" : "text-gray-600 hover:text-gray-400"}`}
                >
                  {item.status === "completed" ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                <span className={`${item.status === "completed" ? "line-through text-gray-500" : "text-gray-200"} flex-1`}>
                  {item.description}
                </span>
                <button
                  onClick={(e) => deleteItem(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
