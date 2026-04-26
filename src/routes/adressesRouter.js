import express from "express";

import {attachUserId} from "../../utils/decodeJwt.js";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "../controllers/adressesOperations.js";

const adressRouter = express.Router();

// Address routes – only GET works
adressRouter.get("/addresses", attachUserId, getAddresses);
adressRouter.post("/addresses", attachUserId, addAddress);
adressRouter.delete("/addresses/:id", attachUserId, deleteAddress);
adressRouter.patch("/addresses/:id/default", attachUserId, setDefaultAddress);

export default adressRouter;
