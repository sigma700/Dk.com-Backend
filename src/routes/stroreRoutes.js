import {Router} from "express";
import multer from "multer";
import {
  createOrder,
  getAllProducts,
  getCart,
  getOrderById,
  getProductData,
  getProductsSrch,
  getShippingRates,
  updateCart,
  useStoreLogic,
} from "../controllers/stroreLogics.js";
import {attachUserId} from "../../utils/decodeJwt.js";

export const storeRouter = Router();

// Configure multer with file filter
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {fileSize: 5 * 1024 * 1024}, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.",
        ),
      );
    }
  },
});

// Product routes
storeRouter.get("/get-all-products", getAllProducts);
storeRouter.get("/getCart", getCart);
storeRouter.get("/get-searched", getProductsSrch);
storeRouter.get("/get-product/:id", getProductData);
storeRouter.get("/order/:id", attachUserId, getOrderById);
storeRouter.post("/create-product", upload.single("image"), useStoreLogic);
storeRouter.get("/shipping/rates", getShippingRates);

storeRouter.post("/cart/add", updateCart);
storeRouter.post("/cart/order", attachUserId, createOrder);

// Optional: Add error handling middleware for multer
storeRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
});
