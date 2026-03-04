import {Cart, Product} from "../src/database/models/storeSchema.js";

//algo for makign the addd to cart functionality run
export const addToCart = async (
  ownerField,
  ownerValue,
  productId,
  quantity = 1,
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product could not be found !");
  if (product.stock < quantity) throw new Error("Insufficient stock !");

  const priceAtAdd = product.price;

  //now updating the currrent carT item

  let cart = await Cart.findOneAndUpdate(
    {
      [ownerField]: ownerValue,
      status: "active",
      " items.product": productId,
    },
    {
      $inc: {"items.$.quantity": quantity},
    },
    {returnDocument: "after"},
  );

  if (cart) return cart;
  //if no cart exists then either create the cart or just add a new item : DAMN AM SMART
  cart = await Cart.findOneAndUpdate(
    {[ownerField]: ownerValue, status: "active"},
    {
      $push: {
        items: {product: productId, quantity, priceAtAdd},
      },
    },

    {returnDocument: "after", upsert: true},
  );
  await mergeDuplicateItems(cart);

  return cart;
};

//to avoid creating  a new document

export const mergeDuplicateItems = async (cart) => {
  const itemMap = new Map();
  for (const item of cart.items) {
    const key = item.product.toString();
    if (itemMap.has(key)) {
      itemMap.get(key).quantity += item.quantity;
    } else {
      itemMap.set(key, item);
    }
  }
  cart.items = Array.from(itemMap.values());
  await cart.save();
};
