import axios from "axios";

export const API = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3000"
      : "https://to-do-list-hqwe.onrender.com",
  withCredentials: true, // must be true for cookies
});

// Auth
export const login = (data) => API.post("/login", data);
export const register = (data) => API.post("/register", data);
export const logout = () => API.post("/logout");
export const getSession = () => API.get("/get-session");

// Lists
export const getLists = () => API.get("/get-list");
export const addList = (listTitle) => API.post("/add-list", { listTitle });
export const deleteList = (listId) => API.post(`/delete-list/${listId}`);

// Items
export const getItems = (listId) => API.get(`/get-items/${listId}`);
export const addItem = (listId, description) => API.post("/add-item", { listId, description });
export const deleteItem = (itemId) => API.post(`/delete-item/${itemId}`);
export const updateItem = (itemId, data) => API.post(`/update-item/${itemId}`, data);
