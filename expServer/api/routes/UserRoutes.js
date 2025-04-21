import express from "express";
const userRouter = express.Router();  

import pool from "./PoolConnection.js";

userRouter.get("/users", async (req, res) => {
  try {
    console.log(req);
    const result = await pool.query("SELECT * FROM users");
    console.log(result.rows);
    res.json(result.rows); 

  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

userRouter.get("/getuser", async (req, res) => {
  try {
    const id1 = req.query.id;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id1]);
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ rows: [] });
  }
});

userRouter.delete("/deluser", async (req, res) => {
  try {
    const id1 = req.query.id;
    await pool.query("DELETE FROM users WHERE id = $1", [id1]);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

userRouter.post("/updateuser", async (req, res) => {
  try {
    const { id, fname, lname, email, city, zipcode, username, password } = req.body;
    const query = `
      UPDATE users
      SET fname = $1, lname = $2, email = $3, city = $4, zipcode = $5, username = $6, password = $7
      WHERE id = $8
    `;
    await pool.query(query, [fname, lname, email, city, zipcode, username, password, id]);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

userRouter.post("/adduser", async (req, res) => {
  try {
    const { fname, lname, id, email, city, zipcode, username, password } = req.body;
    var fname1 = "'"+fname+"'";
    var lname1 = "'"+lname+"'";
    var email1 = "'"+email+"'";
    var city1 = "'"+city+"'";
    var username1 = "'"+username+"'";
    var password1 = "'"+password+"'";

    const query = `
      INSERT INTO users (id, fname, lname, email, city, zipcode, username, password)
      VALUES (fname1, lname1, id, email1, city1, $6, username1, password1)
    `;
    await pool.query(query, [id, fname, lname, email, city, zipcode, username, password]);
    res.json({ ans: 1 });
  } catch (error) {
    console.error("Query error:", error);
    res.json({ ans: 0 });
  }
});

export default userRouter;
