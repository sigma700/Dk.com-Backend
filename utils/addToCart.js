import {Cart, Product} from "../src/database/models/storeSchema.js";

//algo for makign the addd to cart functionality run
export const addToCart = async (
  ownerField, // e.g., "user" or "sessionId"
  ownerValue, // actual user ID or session string
  productId,
  quantity = 1,
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) throw new Error("Insufficient stock");

  const priceAtAdd = product.price;

  // 1. Try to increment quantity if product already exists in active cart
  let cart = await Cart.findOneAndUpdate(
    {
      [ownerField]: ownerValue,
      status: "active",
      "items.product": productId,
    },
    {$inc: {"items.$.quantity": quantity}},
    {returnDocument: "after"},
  );

  // 2. If product not in cart, push new item (or create cart if none exists)
  if (!cart) {
    cart = await Cart.findOneAndUpdate(
      {[ownerField]: ownerValue, status: "active"},
      {
        $push: {
          items: {product: productId, quantity, priceAtAdd},
        },
      },
      {returnDocument: "after", upsert: true},
    );
  }

  // 3. Merge duplicate items (if any) and clean up
  cart = await mergeDuplicateItems(cart);

  // 4. Populate product details and return
  const populatedCart = await cart.populate({
    path: "items.product",
    select: "name category price image", // only needed fields
  });

  // 5. Add computed subtotal to each item (optional, can be done on frontend)
  populatedCart.items = populatedCart.items.map((item) => ({
    ...item.toObject(),
    subtotal: item.quantity * item.priceAtAdd,
    // Convert image buffer to base64 if sending JSON (optional)
    productImage: item.product.image?.data
      ? `data:${item.product.image.contentType};base64,${item.product.image.data.toString("base64")}`
      : null,
  }));

  return populatedCart;
};

//to avoid creating  a new document
const mergeDuplicateItems = async (cart) => {
  const mergedMap = new Map();

  for (const item of cart.items) {
    const key = item.product.toString();
    if (mergedMap.has(key)) {
      mergedMap.get(key).quantity += item.quantity;
    } else {
      mergedMap.set(key, {...item.toObject()});
    }
  }

  const mergedItems = Array.from(mergedMap.values());
  cart.items = mergedItems;
  await cart.save();
  return cart;
};
