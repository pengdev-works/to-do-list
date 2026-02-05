import express from "express";
import session from "express-session";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import { pool } from "./db.js";
import { hashPassword, comparePassword } from "./components/hash.js";

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== MIDDLEWARE ===== */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    name: "auth-session",
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* ===== AUTH MIDDLEWARE ===== */
const isAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

/* ===== LIST ROUTES ===== */
app.get("/get-list", isAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM list ORDER BY id");
    res.json({ success: true, list: result.rows });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/get-items/:id", isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, description, status FROM items WHERE list_id = $1 ORDER BY id",
      [id]
    );
    res.json({ success: true, items: result.rows });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/add-list", isAuth, async (req, res) => {
  try {
    const { listTitle } = req.body;
    if (!listTitle?.trim())
      return res.status(400).json({ success: false, message: "List title required" });

    const id = uuidv4();
    await pool.query("INSERT INTO list (id, title, status) VALUES ($1, $2, $3)", [
      id,
      listTitle,
      "pending",
    ]);

    res.json({ success: true, list: { id, title: listTitle, status: "pending" } });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/add-item", isAuth, async (req, res) => {
  try {
    const { listId, description } = req.body;
    if (!listId || !description?.trim())
      return res.status(400).json({ success: false, message: "Invalid data" });

    const id = uuidv4();
    await pool.query(
      "INSERT INTO items (id, list_id, description, status) VALUES ($1, $2, $3, $4)",
      [id, listId, description, "pending"]
    );

    res.json({ success: true, item: { id, list_id: listId, description, status: "pending" } });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===== AUTH ROUTES ===== */
app.post("/register", async (req, res) => {
  try {
    const { name, username, password, confirm } = req.body;
    if (!name || !username || !password || !confirm)
      return res.status(400).json({ success: false, message: "Incomplete data" });

    if (password !== confirm)
      return res.status(400).json({ success: false, message: "Passwords do not match" });

    const exists = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (exists.rows.length > 0)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await hashPassword(password);
    await pool.query("INSERT INTO users (name, username, password) VALUES ($1, $2, $3)", [
      name,
      username,
      hashedPassword,
    ]);

    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Incomplete data" });

    const result = await pool.query("SELECT id, name, password FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const user = result.rows[0];
    const match = await comparePassword(password, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    req.session.user = { id: user.id, name: user.name };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/get-session", (req, res) => {
  res.json({ session: !!req.session.user, user: req.session.user || null });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("auth-session");
    res.json({ success: true });
  });
});

/* ===== START SERVER ===== */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
