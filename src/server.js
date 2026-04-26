import express from "express";
import "dotenv/config";
import {connectDb} from "./database/connect.js";
import {userRouter} from "./routes/accounts.js";
import {jokesRouter} from "./routes/jokesRoutes.js";
import {storeRouter} from "./routes/stroreRoutes.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import {attachUserId, setOwner} from "../utils/decodeJwt.js";
import {paymentRouter} from "./routes/paymentsRoute.js";
import cors from "cors";
import adressRouter from "./routes/adressesRouter.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true})); // Parse URL-encoded bodies
app.use(
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
);

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5714",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(attachUserId);
app.use(setOwner);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PAGE LOADED SUCCESSFULLY",
  });
});

app.use("/api", userRouter, jokesRouter, adressRouter);
app.use("/store", storeRouter, paymentRouter);

connectDb();
app.listen(process.env.PORT, () => {
  console.log(`Server listening on : http://localhost:${process.env.PORT}`);
});
