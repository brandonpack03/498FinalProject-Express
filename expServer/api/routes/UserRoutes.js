import express from "express";
const userRouter = express.Router();  
import pool from "./PoolConnection.js";

userRouter.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

userRouter.get("/getuser", async (req, res) => {
  try {
    const id1 = req.query.id;
    const result = await pool.query("SELECT * FROM users WHERE userid = $1", [id1]);
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ rows: [] });
  }
});

userRouter.delete("/deluser", async (req, res) => {
  try {
    const id1 = req.query.id;
    await pool.query("DELETE FROM users WHERE userid = $1", [id1]);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

userRouter.post("/updateuser", async (req, res) => {
  try {
    const { userid, username, password } = req.body;
    const query = `
      UPDATE users
      SET username = '${username}', password = '${password}'
      WHERE userid = ${userid}
    `;
    await pool.query(query);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

userRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 1) {
      const user = result.rows[0];
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

userRouter.post("/adduser", async (req, res) => {
  try {
    const { username, password, balance = 1000.00, isadmin = false } = req.body;
    const query = `
      INSERT INTO users (username, password, balance, isadmin)
      VALUES ('${username}', '${password}', ${balance}, ${isadmin})
    `;
    await pool.query(query);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

userRouter.get("/userdashboard", async (req, res) => {
  const userId = req.query.id;

  try {
    const query = `
      SELECT u.username, u.balance, l.listingid, l.condition, l.price, l.type, l.image
      FROM users u
      LEFT JOIN user_listing ul ON u.userid = ul.userid
      LEFT JOIN listings l ON ul.listingid = l.listingid
      WHERE u.userid = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found or no listings." });
    }

    const { username, balance } = result.rows[0];
    const listings = result.rows
      .filter(row => row.listingid)
      .map(row => ({
        listingid: row.listingid,
        condition: row.condition,
        price: row.price,
        type: row.type,
        image: row.image
      }));

    res.json({ username, balance, listings });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: "Failed to fetch user dashboard." });
  }
});


export default userRouter;
