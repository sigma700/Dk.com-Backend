import {Router} from "express";
import {fetchJokes} from "../controllers/jokes.js";

export const jokesRouter = Router();

jokesRouter.get("/getJoke", fetchJokes);
