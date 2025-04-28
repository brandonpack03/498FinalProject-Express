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

listRouter.delete("/dellisting", async (req, res) => {
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

// POST /shop/sell - Create new listing and assign to user
listRouter.post("/sell", async (req, res) => {
  const { condition, price, type, image, userId } = req.body;

  try {
    // Insert into Listings
    const listingResult = await pool.query(
      `INSERT INTO Listings (Condition, Price, Type, Image)
       VALUES ($1, $2, $3, $4)
       RETURNING ListingID`,
      [condition, price, type, image]
    );

    const listingId = listingResult.rows[0].listingid;

    // Insert into User_Listing
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


export default listRouter;
