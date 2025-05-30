import express from "express";
import cors from "cors";
import userRouter from "./routes/UserRoutes.js";
import listRouter from "./routes/ListingsRoute.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: ["http://localhost:5173", "https://mini-project3-mj9a.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use("/shop", userRouter);
app.use("/shop", listRouter);

app.get("/", (req, res) => {
  try {
    console.log(req);
    res.send("Hello from Express Server");
  } catch (error) {
    console.error("Query error:", error);
    res.send(" Sorry Error");
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));
