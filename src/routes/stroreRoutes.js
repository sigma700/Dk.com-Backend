import {Router} from "express";
import {
  getProductData,
  getProductsSrch,
  useStoreLogic,
} from "../controllers/stroreLogics.js";
import multer from "multer";
export const storeRouter = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {fileSize: 5 * 1024 * 1024},
});
storeRouter.get("/get-searched", getProductsSrch);
storeRouter.get("/get-product/:id", getProductData);
storeRouter.post("/create-product", upload.single("image"), useStoreLogic);
