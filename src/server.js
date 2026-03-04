import express from "express";
import "dotenv/config";
import {connectDb} from "./database/connect.js";
import {userRouter} from "./routes/accounts.js";
import {jokesRouter} from "./routes/jokesRoutes.js";
import {storeRouter} from "./routes/stroreRoutes.js";
import session from "express-session";
import {atatchUserId} from "../utils/decodeJwt.js";
const app = express();

app.use(
  express.json(),
  session({
    secret: process.env.WEBTOKEN, // used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
  atatchUserId,
);

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
