import "dotenv/config";
import express from "express";
import { pool } from "./db.js";
import session from "express-session";
import cors from "cors";
import { hashPassword, comparePassword } from "./components/hash.js";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;


// MIDDLEWARE
// ======================
app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://to-do-list-7b6c.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "mySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
    },
  })
);

// ======================
// TEST DB CONNECTION
// ======================
pool.query("SELECT NOW()")
  .then(res => console.log("✅ DB connected:", res.rows[0]))
  .catch(err => console.error("❌ DB connection error:", err));

// ======================
// AUTH ROUTES
// ======================
app.post("/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name) return res.json({ success: false, message: "Incomplete data" });

    const exists = await pool.query("SELECT id FROM users WHERE username=$1", [username]);
    if (exists.rows.length > 0) return res.json({ success: false, message: "User exists" });

    const hashed = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (username, password, name) VALUES ($1,$2,$3) RETURNING id, username, name",
      [username, hashed, name]
    );

    req.session.user = result.rows[0];
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (!result.rows.length) return res.json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Incorrect password" });

    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.get("/get-session", (req, res) => {
  if (req.session.user) return res.json({ session: true, user: req.session.user });
  res.json({ session: false });
});

// ======================
// LIST ROUTES
// ======================

// Get all lists
app.get("/get-list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM list ORDER BY created_at DESC");
    res.json({ success: true, list: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add list
app.post("/add-list", async (req, res) => {
  try {
    const { listTitle } = req.body;
    if (!listTitle || listTitle.trim() === "") return res.json({ success: false, message: "List title required" });

    const newId = crypto.randomUUID();
    const result = await pool.query(
      "INSERT INTO list (id, title) VALUES ($1, $2) RETURNING *",
      [newId, listTitle]
    );

    res.json({ success: true, list: result.rows[0] });
  } catch (err) {
    console.error("ADD LIST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update list
app.post("/update-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { listTitle } = req.body;
    if (!listTitle || listTitle.trim() === "") return res.json({ success: false, message: "List title required" });

    const result = await pool.query(
      "UPDATE list SET title=$1 WHERE id=$2 RETURNING *",
      [listTitle, id]
    );

    res.json({ success: true, list: result.rows[0] });
  } catch (err) {
    console.error("UPDATE LIST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete list
app.post("/delete-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM list WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE LIST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// ITEM ROUTES
// ======================

// Get items by list UUID
app.get("/get-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM items WHERE list_id=$1 ORDER BY created_at",
      [id]
    );
    res.json({ success: true, items: result.rows });
  } catch (err) {
    console.error("GET ITEMS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add item
app.post("/add-item", async (req, res) => {
  try {
    const { listId, description } = req.body;
    if (!listId || !description || description.trim() === "") return res.json({ success: false, message: "Missing listId or description" });

    const newId = crypto.randomUUID();
    const result = await pool.query(
      "INSERT INTO items (id, list_id, description) VALUES ($1,$2,$3) RETURNING *",
      [newId, listId, description]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete item
app.post("/delete-item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ITEM ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update item
app.post("/update-item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, status } = req.body;

    if (!description && !status) return res.json({ success: false, message: "Nothing to update" });

    let query = "UPDATE items SET ";
    const params = [];
    let idx = 1;

    if (description) {
      query += `description=$${idx} `;
      params.push(description);
      idx++;
    }

    if (status) {
      if (params.length > 0) query += ", ";
      query += `status=$${idx} `;
      params.push(status);
      idx++;
    }

    query += `WHERE id=$${idx} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("UPDATE ITEM ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
