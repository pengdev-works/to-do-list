import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

function List() {
  const { id } = useParams(); // list ID
  const [items, setItems] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [newItem, setNewItem] = useState("");
  const navigate = useNavigate();

  // Fetch items for this list
  const fetchItems = async () => {
    try {
      const res = await fetch(`http://localhost:3000/get-items/${id}`);
      const data = await res.json();
      if (data.success) setItems(data.items);
      else setItems([]);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // Fetch list title
  const fetchListTitle = async () => {
    try {
      const res = await fetch("http://localhost:3000/get-list");
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

  // Add new item
  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: id, description: newItem }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => [...prev, data.item]); // Add item to table
        setNewItem("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 max-w-3xl mx-auto">
        <button
          className="mb-4 text-blue-700 hover:underline"
          onClick={() => navigate("/Home")}
        >
          ← Back to lists
        </button>

        <h1 className="text-2xl font-bold mb-4">{listTitle}</h1>

        {/* Add new item */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border px-3 py-2 rounded-md"
            placeholder="New item description..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button
            onClick={addItem}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add Item
          </button>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider bg-amber-300 text-blue-700">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider bg-amber-200 text-blue-700">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider bg-amber-300 text-blue-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-gray-500 text-center">
                    No items yet
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4 text-sm text-gray-700">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default List;
