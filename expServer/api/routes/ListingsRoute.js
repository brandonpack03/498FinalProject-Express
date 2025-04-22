import express from "express";
const userRouter = express.Router();  
import pool from "./PoolConnection.js";

userRouter.get("/listings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM listings");
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

userRouter.get("/getlisting", async (req, res) => {
  try {
    const id1 = req.query.id;
    const result = await pool.query("SELECT * FROM users WHERE listingid = $1", [id1]);
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ rows: [] });
  }
});

userRouter.delete("/dellisting", async (req, res) => {
  try {
    const id1 = req.query.id;
    await pool.query("DELETE FROM listings WHERE listingid = $1", [id1]);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

// userRouter.post("/updatelisting", async (req, res) => {
//   try {
//     const { listingid, username, password } = req.body;
//     const query = `
//       UPDATE users
//       SET username = '${username}', password = '${password}'
//       WHERE userid = ${userid}
//     `;
//     await pool.query(query);
//     res.json({ ans: 1 });
//   } catch (error) {
//     console.error("Query error:", error);
//     res.json({ ans: 0 });
//   }
// });



userRouter.post("/addlisting", async (req, res) => {
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


export default userRouter;
