// server/index.js
import "dotenv/config";
import express from "express";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { pool } from "./db.js";
import { hashPassword, comparePassword } from "./components/hash.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://to-do-list-hqwe.onrender.com", // your Render frontend
  "https://to-do-list-9952vij9e-pengdev-works-projects.vercel.app", // production Vercel
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server-to-server
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: ${origin} not allowed`), false);
    },
    credentials: true, // important!
  })
);

// ======================
// BODY PARSING
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set("trust proxy", 1); // for Render / Vercel

const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS required in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
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
// LOGGING
// ======================
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} - from origin: ${req.headers.origin}`);
  next();
});

// ======================
// AUTH ROUTES
// ======================
app.post("/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name)
      return res.status(400).json({ success: false, message: "Incomplete data" });

    const exists = await pool.query("SELECT id FROM users WHERE username=$1", [username]);
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, message: "User already exists" });

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
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Incomplete data" });

    const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", {
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ success: true });
  });
});

app.get("/get-session", (req, res) => {
  if (req.session.user) return res.json({ session: true, user: req.session.user });
  res.json({ session: false });
});

app.get("/get-list", async (req, res) => {
  try {
    const lists = await pool.query("SELECT * FROM list ORDER BY id DESC");
    res.json({ success: true, list: lists.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching lists" });
  }
});

// POST /add-list
app.post("/add-list", async (req, res) => {
  const { listTitle } = req.body;
  if (!listTitle) return res.json({ success: false, message: "Title is required" });

  try {
    const id = uuidv4(); // generate unique UUID
    const newList = await pool.query(
      "INSERT INTO list (id, title, status) VALUES ($1, $2, $3) RETURNING *",
      [id, listTitle, "pending"]
    );
    res.json({ success: true, list: newList.rows[0] });
  } catch (err) {
    console.error("ADD LIST ERROR:", err);
    res.status(500).json({ success: false, message: "Error adding list" });
  }
});


app.post("/delete-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM list WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE LIST ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.get("/get-items/:listId", async (req, res) => {
  const { listId } = req.params;
  try {
    const items = await pool.query("SELECT * FROM items WHERE list_id = $1 ORDER BY id ASC", [listId]);
    res.json({ success: true, items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching items" });
  }
});


app.post("/add-item", async (req, res) => {
  const { listId, description } = req.body;

  if (!listId || !description) {
    return res.status(400).json({ success: false, message: "List ID and description are required" });
  }

  try {
    const id = uuidv4(); // generate UUID for the item
    const result = await pool.query(
      `INSERT INTO items (id, list_id, description, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, listId, description, "pending"]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("ADD ITEM ERROR:", err);
    res.status(500).json({ success: false, message: "Error adding item" });
  }
});

app.post("/update-item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, status } = req.body;

    if (!description && status === undefined)
      return res.status(400).json({ success: false, message: "Nothing to update" });

    const updates = [];
    const params = [];
    let idx = 1;

    if (description) {
      updates.push(`description=$${idx}`);
      params.push(description);
      idx++;
    }

    if (status !== undefined) {
      updates.push(`status=$${idx}`);
      params.push(status);
      idx++;
    }

    params.push(id);
    const query = `UPDATE items SET ${updates.join(", ")} WHERE id=$${idx} RETURNING *`;
    const result = await pool.query(query, params);

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("UPDATE ITEM ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
