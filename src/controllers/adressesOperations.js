import {Order} from "../database/models/storeSchema.js";

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({user: userId}, "shippingAddress").lean();

    // Extract unique addresses (simple deduplication)
    const uniqueMap = new Map();
    for (const order of orders) {
      const addr = order.shippingAddress;
      if (!addr) continue;

      // Create a unique key based on the address content
      const key = `${addr.name}|${addr.line1}|${addr.city}|${addr.county}|${addr.phone}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: Buffer.from(key).toString("base64"), // generate a reproducible pseudo id
          name: addr.name,
          line1: addr.line1,
          line2: addr.line2 || "",
          city: addr.city,
          county: addr.county,
          phone: addr.phone,
          type: addr.type || "shipping",
          isDefault: false, // no default concept in read-only mode
        });
      }
    }

    const addresses = Array.from(uniqueMap.values());
    res.status(200).json({success: true, data: addresses});
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({success: false, message: "Server error"});
  }
};

// --- Write operations are not supported ---
export const addAddress = async (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Adding addresses is not supported – addresses are read‑only from past orders",
  });
};

export const deleteAddress = async (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Deleting addresses is not supported – addresses are read‑only from past orders",
  });
};

export const setDefaultAddress = async (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Setting default address is not supported – addresses are read‑only from past orders",
  });
};
