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

  const cart = await Cart.findOneAndUpdate(
    {
      [ownerField]: ownerValue,
      status: "active",
      " items.product": productId,
    },
    {
      $inc: {"items.$.quantity": quantity},
    },
    {new: true},
  );

  if (cart) return cart;
  //if no cart exists then either create the cart or just add a new item : DAMN AM SMART
  return Cart.findOneAndUpdate(
    {[ownerField]: ownerValue, status: "active"},
    {
      $push: {
        items: {product: productId, quantity, priceAtAdd},
      },
    },
    {upsert: true, new: true},
  );
};
