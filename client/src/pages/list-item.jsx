import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function List() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [newItem, setNewItem] = useState("");

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleRaw, setEditingTitleRaw] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemDesc, setEditingItemDesc] = useState("");

  const navigate = useNavigate();

  // ======================
  // FETCH ITEMS
  // ======================
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/get-items/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // FETCH LIST TITLE
  // ======================
  const fetchListTitle = async () => {
    try {
      const res = await fetch(`${API}/get-list`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const list = data.list.find((l) => l.id === id);
        if (list) setListTitle(list.title);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchListTitle();
  }, [id]);

  // ======================
  // ADD ITEM
  // ======================
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
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add item.',
      });
    }
  };

  // ======================
  // DELETE ITEM
  // ======================
  const deleteItem = async (itemId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API}/delete-item/${itemId}`, { method: "POST", credentials: "include" });
      setItems(prev => prev.filter(i => i.id !== itemId));
      Swal.fire(
        'Deleted!',
        'Your task has been deleted.',
        'success'
      );
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete task.',
      });
    }
  };

  // ======================
  // TOGGLE STATUS
  // ======================
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
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // UPDATE LIST TITLE
  // ======================
  const updateListTitle = async () => {
    if (!editingTitleRaw.trim()) return;
    try {
      const res = await fetch(`${API}/update-list/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listTitle: editingTitleRaw }),
      });
      const data = await res.json();
      if (data.success) {
        setListTitle(data.list.title);
        setIsEditingTitle(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: data.message,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save title edit.',
      });
    }
  };

  // ======================
  // SAVE ITEM EDIT
  // ======================
  const saveItemEdit = async (itemId) => {
    if (!editingItemDesc.trim()) return;
    try {
      const res = await fetch(`${API}/update-item/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: editingItemDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i.id === itemId ? data.item : i));
        setEditingItemId(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: data.message,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save task edit.',
      });
    }
  };

  return (
    <>
      <Header />

      <div className="p-6 max-w-4xl mx-auto my-10 relative">
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-2 text-indigo-100 hover:text-white bg-indigo-900/40 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-700/50 transition-colors shadow-sm w-fit"
        >
          ← Back to Dashboard
        </button>

        <div className="container relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 animate-slide-down">
                  <input
                    type="text"
                    className="flex-1 max-w-lg border border-indigo-300 bg-white/80 px-4 py-2 rounded-xl text-3xl font-extrabold text-gray-800 focus:ring-4 focus:ring-indigo-500/20 outline-none"
                    value={editingTitleRaw}
                    onChange={(e) => setEditingTitleRaw(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && updateListTitle()}
                    autoFocus
                  />
                  <button
                    onClick={updateListTitle}
                    className="bg-green-500 text-white px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors font-bold shadow-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 transition-colors font-bold shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-3">
                  <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 m-0 leading-tight">
                    {listTitle || "Loading..."}
                  </h1>
                  <button
                    onClick={() => {
                      setEditingTitleRaw(listTitle);
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-amber-500/10 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm text-sm font-semibold"
                  >
                    Edit Title
                  </button>
                </div>
              )}
            </div>

            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2 w-fit">
              <span className="text-indigo-800 font-bold">{items.filter(i => i.status === 'completed').length}</span>
              <span className="text-indigo-400">/</span>
              <span className="text-indigo-800 font-bold">{items.length}</span>
              <span className="text-sm text-indigo-600 font-medium ml-1">Tasks</span>
            </div>
          </div>

          {/* Add Item */}
          <div className="mb-10 flex gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-200">
            <input
              type="text"
              className="flex-1 bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none m-0 text-gray-700"
              placeholder="Add a new task..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <button
              onClick={addItem}
              className="shadow-md bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors m-0 font-semibold"
            >
              Add Task
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.length === 0 && (
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
                <div className="text-4xl mb-3 opacity-50">✨</div>
                <p className="text-gray-500 font-medium text-lg">No tasks here yet.</p>
                <p className="text-gray-400 text-sm mt-1">Add one above to get started</p>
              </div>
            )}

            {items.map(item => (
              <div
                key={item.id}
                className={`group flex items-center gap-4 bg-white border p-4 rounded-2xl shadow-sm transition-all ${item.status === "completed"
                  ? "border-green-100 bg-green-50/30"
                  : "border-gray-100 hover:border-indigo-200 hover:shadow-md"
                  }`}
              >
                {/* Status Toggle Button / Checkbox style */}
                <button
                  onClick={() => toggleStatus(item)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.status === "completed"
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300 hover:border-indigo-400 relative"
                    }`}
                >
                  {item.status === "completed" && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 overflow-hidden">
                  {editingItemId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-indigo-300 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={editingItemDesc}
                        onChange={(e) => setEditingItemDesc(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveItemEdit(item.id)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p className={`text-lg transition-all ${item.status === "completed" ? "text-gray-400 line-through" : "text-gray-700 font-medium"
                      }`}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingItemId === item.id ? (
                    <>
                      <button onClick={() => saveItemEdit(item.id)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 text-sm font-bold transition-colors">Save</button>
                      <button onClick={() => setEditingItemId(null)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-sm font-bold transition-colors">Cancel</button>
                    </>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItemId(item.id);
                          setEditingItemDesc(item.description);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 text-sm font-bold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 text-sm font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
