import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Swal from "sweetalert2";

export default function Home() {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [editingListId, setEditingListId] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ======================
  // SESSION CHECK
  // ======================
  const checkSession = async () => {
    try {
      const res = await fetch(`${API}/get-session`, { credentials: "include" });
      const data = await res.json();
      if (!data.session) {
        navigate("/"); // redirect to login
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  // ======================
  // FETCH LISTS
  // ======================
  const fetchLists = async () => {
    try {
      const res = await fetch(`${API}/get-list`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setLists(data.list);
        localStorage.setItem("myLists", JSON.stringify(data.list)); // save to localStorage
      }
    } catch (err) {
      console.error(err);

      // fallback: load from localStorage
      const saved = JSON.parse(localStorage.getItem("myLists") || "[]");
      if (saved.length > 0) setLists(saved);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    await fetch(`${API}/logout`, { credentials: "include" });
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      const ok = await checkSession();
      if (ok) fetchLists();
    };
    init();
  }, []);

  // ======================
  // SAVE LISTS TO LOCALSTORAGE ON CHANGE
  // ======================
  useEffect(() => {
    localStorage.setItem("myLists", JSON.stringify(lists));
  }, [lists]);

  // ======================
  // ADD LIST
  // ======================
  const addList = async () => {
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API}/add-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listTitle: title }),
      });

      if (data.success) {
        setLists(prev => [data.list, ...prev]); // add to top
        inputRef.current.focus(); // keep focus
        setTitle(""); // Clear input on success
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
        text: 'Failed to add list.',
      });
    }
  };

  // ======================
  // DELETE LIST
  // ======================
  const deleteList = async (id, e) => {
    e.stopPropagation(); // Prevent navigating to list

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
      await fetch(`${API}/delete-list/${id}`, {
        method: "POST",
        credentials: "include",
      });
      setLists(prev => prev.filter(l => l.id !== id));
      Swal.fire(
        'Deleted!',
        'Your list has been deleted.',
        'success'
      );
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete list.',
      });
    }
  };

  // ======================
  // SAVE LIST EDIT
  // ======================
  const saveListEdit = async (id, e) => {
    e.stopPropagation();
    if (!editingListTitle.trim()) return;
    try {
      const res = await fetch(`${API}/update-list/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listTitle: editingListTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setLists(prev => prev.map(l => (l.id === id ? data.list : l)));
        setEditingListId(null);
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
        text: 'Failed to save edits.',
      });
    }
  };

  return (
    <>
      <Header />

      <div className="p-6 max-w-2xl mx-auto my-10">
        <div className="container relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8">

          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 m-0">
              My Lists
            </h1>
            <button
              onClick={logout}
              className="bg-rose-500/10 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              Logout
            </button>
          </div>

          {/* Add list */}
          <div className="mb-8 flex gap-3 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-white/80 backdrop-blur-sm border-none shadow-sm px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 m-0"
              placeholder="✨ What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addList()}
            />
            <button
              onClick={addList}
              className="shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all m-0"
            >
              Create List
            </button>
          </div>

          {/* Lists */}
          <div className="space-y-4">
            {lists.length === 0 && (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No lists yet. Create your first one above!</p>
              </div>
            )}
            {lists.map((list) => (
              <div
                key={list.id}
                className="group relative flex justify-between items-center bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer overflow-hidden"
                onClick={() => {
                  if (editingListId !== list.id) navigate(`/list/${list.id}`);
                }}
              >
                {/* Decorative glowing gradient left border effect */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex-1">
                  {editingListId === list.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        className="flex-1 border border-indigo-300 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editingListTitle}
                        onChange={(e) => setEditingListTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveListEdit(list.id, e)}
                      />
                      <button
                        onClick={(e) => saveListEdit(list.id, e)}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingListId(null);
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors mb-1">{list.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${list.status === "completed" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                          {list.status || "active"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {editingListId !== list.id && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingListId(list.id);
                        setEditingListTitle(list.title);
                      }}
                      className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 font-medium transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => deleteList(list.id, e)}
                      className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-100 font-medium transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
