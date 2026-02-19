import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import App from "./pages/App.jsx";           // Login page
import Home from "./pages/Home.jsx";         // Home page
import Register from "./pages/Register.jsx"; // Register page
import List from "./pages/list-item.jsx";    // List items page

// Global CSS
import "./css/globals.css";

// Render the app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/" element={<App />} />

        {/* Home page after login */}
        <Route path="/home" element={<Home />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* List items page */}
        <Route path="/list/:id" element={<List />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
