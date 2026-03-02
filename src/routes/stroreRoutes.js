import {Router} from "express";
import {useStoreLogic} from "../controllers/stroreLogics.js";
import multer from "multer";
export const storeRouter = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {fileSize: 5 * 1024 * 1024},
});
storeRouter.post("/create-product", upload.single("image"), useStoreLogic);
