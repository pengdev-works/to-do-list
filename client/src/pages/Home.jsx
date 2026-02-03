import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

function Home() {
  const [lists, setLists] = useState([]);
  const [titles, setTitle] = useState("");
  const navigate = useNavigate();

  // Fetch all lists
  const fetchLists = async () => {
    try {
      const res = await fetch("http://localhost:3000/get-list");
      const data = await res.json();
      if (data.success) setLists(data.list);
    } catch (err) {
      console.error("Error fetching lists:", err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // Add a new list
  const addList = async () => {
    if (!titles.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/add-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listTitle: title }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setLists(prev => [...prev, data.list]); // Add new list to state
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error adding list:", err);
    }
  };

  return (
    <>
      <Header />

      <div className="p-6 max-w-md mx-auto">
        {/* Add new list */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border px-3 py-2 rounded-md"
            placeholder="New list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={addList}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add
          </button>
        </div>

        {/* Display lists */}
        <div className="space-y-2">
          {lists.length === 0 && <p className="text-gray-500">No lists yet.</p>}
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/list/${list.id}`)}
              className="cursor-pointer rounded-lg bg-amber-200 p-4 shadow hover:bg-amber-300 transition"
            >
              <h2 className="text-blue-700 font-semibold">{list.title}</h2>
              <p className="text-gray-600 text-sm">Status: {list.status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
