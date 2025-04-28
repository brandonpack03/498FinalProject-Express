import pg from "pg";
import dotenv from "dotenv";
dotenv.config(); 
const { Pool } = pg;
const PORT = process.env.PORT || 3000;

 const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to Neon PostgreSQL database!");
    client.release();
  })
  .catch((err) => {
    console.error("Database connection error:", err.stack);
    console.error("Detailed error info:", err);
  });
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

export default pool;