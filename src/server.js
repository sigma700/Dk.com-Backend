import express from "express";
import "dotenv/config";
import {connectDb} from "./database/connect.js";
import {userRouter} from "./routes/accounts.js";
import {jokesRouter} from "./routes/jokesRoutes.js";
import {storeRouter} from "./routes/stroreRoutes.js";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PAGE LOADED SUCCESSFULLY",
  });
});

app.use("/api", userRouter, jokesRouter, storeRouter);

connectDb();
app.listen(process.env.PORT, () => {
  console.log(`Server listening on :  http://localhost:${process.env.PORT}`);
});
