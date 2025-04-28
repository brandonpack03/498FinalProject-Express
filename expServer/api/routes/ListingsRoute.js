import express from "express";
const listRouter = express.Router();  
import pool from "./PoolConnection.js";

listRouter.get("/listings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM listings");
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

listRouter.get("/getuserlisting", async (req, res) => {
  try {
    const id1 = req.query.id;
    const result = await pool.query("SELECT * FROM users WHERE listingid = $1", [id1]);
    res.json(result.rows);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ rows: [] });
  }
});
listRouter.delete("/deletelisting", async (req, res) => {
  const { id } = req.query;

  try {
    await pool.query("DELETE FROM User_Listing WHERE listingid = $1", [id]);
    await pool.query("DELETE FROM Listings WHERE listingid = $1", [id]);

    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ error: "Failed to delete listing." });
  }
});


listRouter.post("/addlisting", async (req, res) => {
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

listRouter.post("/sell", async (req, res) => {
  const { condition, type, image, userId } = req.body;

  
  const basePrices = {
    CPU: 400,
    GPU: 500,
    RAM: 300,
    "Hard Drive": 200,
  };

  
  const depreciation = {
    "Brand New": 1.0,
    "Lightly Used": 0.9,
    "Poorly Used": 0.7,
    "Damaged": 0.5,
  };

  try {

    if (!basePrices[type] || !depreciation[condition]) {
      return res.status(400).json({ error: "Invalid type or condition" });
    }


    const originalPrice = basePrices[type];
    const finalPrice = originalPrice * depreciation[condition];


    const listingResult = await pool.query(
      `INSERT INTO Listings (Condition, Price, Type, Image)
       VALUES ($1, $2, $3, $4)
       RETURNING ListingID`,
      [condition, finalPrice, type, image]
    );

    const listingId = listingResult.rows[0].listingid;


    await pool.query(
      `INSERT INTO User_Listing (ListingID, UserID)
       VALUES ($1, $2)`,
      [listingId, userId]
    );

    res.status(201).json({ message: "Listing created and assigned to user." });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

listRouter.get("/browselistings", async (req, res) => {
  try {
    const query = `
      SELECT l.*, ul.userid
      FROM Listings l
      JOIN User_Listing ul ON l.listingid = ul.listingid
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching browse listings:", error);
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});

listRouter.post("/buy", async (req, res) => {
  const { userId, listingId, price } = req.body;

  try {

    await pool.query(
      `UPDATE users SET balance = balance - $1 WHERE userid = $2`,
      [price, userId]
    );


    await pool.query(`DELETE FROM User_Listing WHERE listingid = $1`, [listingId]);
    await pool.query(`DELETE FROM Listings WHERE listingid = $1`, [listingId]);

    res.json({ message: "Purchase successful" });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Failed to process purchase." });
  }
});

listRouter.get("/getbalance", async (req, res) => {
  const { id } = req.query;

  try {
    const result = await pool.query(
      "SELECT balance FROM users WHERE userid = $1",
      [id]
    );

    if (result.rows.length > 0) {
      res.json({ balance: result.rows[0].balance });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});



//your mom
export default listRouter;
