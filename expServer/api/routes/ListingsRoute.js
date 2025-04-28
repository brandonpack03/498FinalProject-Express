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

listRouter.post("/sell", async (req, res) => {
  const { condition, type, image, userId } = req.body;

  // Base prices
  const basePrices = {
    CPU: 400,
    GPU: 500,
    RAM: 300,
    "Hard Drive": 200,
  };

  // Depreciation multipliers
  const depreciation = {
    "Brand New": 1.0,
    "Lightly Used": 0.9,
    "Poorly Used": 0.7,
    "Damaged": 0.5,
  };

  try {
    // Validate inputs
    if (!basePrices[type] || !depreciation[condition]) {
      return res.status(400).json({ error: "Invalid type or condition" });
    }

    // Calculate price
    const originalPrice = basePrices[type];
    const finalPrice = originalPrice * depreciation[condition];

    // Insert into Listings
    const listingResult = await pool.query(
      `INSERT INTO Listings (Condition, Price, Type, Image)
       VALUES ($1, $2, $3, $4)
       RETURNING ListingID`,
      [condition, finalPrice, type, image]
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

//your mom
export default listRouter;
