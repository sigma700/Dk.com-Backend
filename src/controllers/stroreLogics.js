import {addToCart} from "../../utils/addToCart.js";
import {calculateShippingCost} from "../../utils/calcShippingRatesKe.js";
import {isValidKenyanPhone} from "../../utils/numberFormater.js";
import {Cart, Order, Product} from "../database/models/storeSchema.js";
import mongoose from "mongoose";

export const useStoreLogic = async (req, res) => {
  const {name, description, price, stock, category} = req.body;
  const file = req.file;
  try {
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: "Appears that you are missing some required fields !",
      });
    }

    const createdProducts = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image: {
        data: file.buffer,
        contentType: file.mimetype,
      },
    });

    res.status(201).json({
      success: true,
      message: "Created the new product",
      data: createdProducts,
    });

    await createdProducts.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Check the console for more info about the error",
    });
  }
};

export const getProductData = async (req, res) => {
  try {
    const requiredProduct = await Product.findById(req.params.id);

    if (
      !requiredProduct ||
      !requiredProduct.image ||
      !requiredProduct.image.data
    ) {
      return res.status(404).json({
        success: false,
        message: `The product with the id of ${req.params.id} cannot be retrieved !`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Here is the product you are looking for !",
      data: requiredProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Check the console for more info about the error message !",
    });
  }
};

export const getProductsSrch = async (req, res) => {
  const {q, category} = req.query;
  let filter = {};

  try {
    if (q) {
      filter.name = {$regex: q, $options: "i"};
    } else {
      return res.status(404).json({
        success: false,
        message: `No products with the name of ${q} are found in the DB !`,
        data: null,
      });
    }

    if (category) {
      filter.category = category;
    }
    const searchedProducts = await Product.find(filter);

    res.status(200).json({
      success: true,
      message: "Here are the products that you were looking for",
      data: searchedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "There was a problem somewhere in the code, check the console for more info about the error !",
      data: null,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      message: "Here are all the products found",
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      success: false,
      message: "Check console for more info about the error please !",
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const ownerField = req.user ? "user" : "sessionId";
    const ownerValue = req.user ? req.user.id : req.session.id;

    const cart = await Cart.findOne({
      [ownerField]: ownerValue,
      status: "active",
    }).populate({
      path: "items.product",
      select: "name category price image",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {items: []},
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const {productId, quantity = 1} = req.body;
    const ownerField = req.user ? "user" : "sessionId";
    const ownerValue = req.user ? req.user.id : req.session.id;

    const cart = await addToCart(ownerField, ownerValue, productId, quantity);
    res.status(200).json({
      success: true,
      message: "Successfully updated the cart section",
      data: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Check console for more info about the error !",
      data: null,
    });
  }
};

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ownerField = req.user ? "user" : "sessionId";
    const ownerValue = req.user ? req.user.id : req.session.id;

    const {
      email,
      firstName,
      lastName,
      subCounty,
      ward,
      streetAddress,
      paymentMethod,
      phoneNumber,
      county,
      postalCode,
      deliveryInstructions,
      estateOrArea,
      shippingMethod = "standard",
      billingSameAsShipping = true,
      billingAddress,
      items: frontendItems, // fallback items from request body
    } = req.body;

    if (phoneNumber && !isValidKenyanPhone(phoneNumber)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "Invalid Kenyan phone number. Use format 0712345678 or +254712345678",
      });
    }

    // Try to find active cart in DB
    let cart = await Cart.findOne({
      [ownerField]: ownerValue,
      status: "active",
    })
      .populate("items.product")
      .session(session);

    let orderItems = [];
    let subtotal = 0;

    if (cart && cart.items.length > 0) {
      // Use database cart
      for (const item of cart.items) {
        const product = item.product;
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }
        orderItems.push({
          product: product._id,
          name: product.name,
          price: item.priceAtAdd,
          quantity: item.quantity,
          image: product.image?.data
            ? `data:${product.image.contentType};base64,${product.image.data.toString("base64")}`
            : product.images?.[0] || null,
        });
        subtotal += item.priceAtAdd * item.quantity;
      }
    } else if (frontendItems && frontendItems.length > 0) {
      // Fallback: use items sent from frontend
      for (const item of frontendItems) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Product ${item.productId} not found`,
          });
        }
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }
        orderItems.push({
          product: product._id,
          name: product.name,
          price: item.price,
          quantity: item.quantity,
          image: product.image?.data
            ? `data:${product.image.contentType};base64,${product.image.data.toString("base64")}`
            : product.images?.[0] || null,
        });
        subtotal += item.price * item.quantity;
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({success: false, message: "Cart is empty"});
    }

    let shippingFee = 5.0;
    if (county) {
      shippingFee = await calculateShippingCost(
        county,
        shippingMethod,
        subtotal,
      );
    }
    const total = subtotal + shippingFee;

    const shippingAddress = {
      email,
      firstName,
      lastName,
      subCounty,
      ward,
      streetAddress,
      phoneNumber,
      county: county || "",
      postalCode: postalCode || "",
      deliveryInstructions: deliveryInstructions || "",
      estateOrArea: estateOrArea || "",
      country: "KE",
    };

    const orderData = {
      user: req.user ? req.user.id : null,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      shippingAddress,
      paymentStatus: "pending",
      paymentMethod,
      orderStatus: "processing",
      shippingMethod,
      billingSameAsShipping,
      ...(billingSameAsShipping ? {} : {billingAddress}),
    };

    const [order] = await Order.create([orderData], {session});

    // If we used a database cart, convert it and update stock
    if (cart && cart.items.length > 0) {
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(
          item.product._id,
          {$inc: {stock: -item.quantity}},
          {session},
        );
      }
      cart.status = "converted";
      cart.items = [];
      await cart.save({session});
    } else {
      // If we used fallback items, reduce stock for those products
      for (const item of frontendItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          {$inc: {stock: -item.quantity}},
          {session},
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create order error:", error);
    res.status(500).json({success: false, message: "Server error"});
  }
};

export const checkOut = async (req, res) => {
  // placeholder for payment initiation
};

export const getShippingRates = async (req, res) => {
  try {
    const {county, method = "standard"} = req.query;
    if (!county) {
      return res
        .status(400)
        .json({success: false, message: "County is required"});
    }

    const ownerField = req.user ? "user" : "sessionId";
    const ownerValue = req.user ? req.user.id : req.session.id;
    const cart = await Cart.findOne({
      [ownerField]: ownerValue,
      status: "active",
    });

    let subtotal = 0;
    if (cart && cart.items) {
      subtotal = cart.items.reduce(
        (sum, item) => sum + item.priceAtAdd * item.quantity,
        0,
      );
    }

    const majorCities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
    let baseCost = majorCities.includes(county) ? 150 : 250;
    if (subtotal >= 5000) baseCost = 0;

    const methods = {
      standard: {
        name: "Standard Delivery",
        cost: baseCost,
        days: "3‑5 business days",
      },
      express: {
        name: "Express Delivery",
        cost: baseCost + 300,
        days: "1‑2 business days",
      },
      "same-day": {
        name: "Same Day (Nairobi only)",
        cost: baseCost + 600,
        days: "within 24h",
      },
    };

    res.json({success: true, methods});
  } catch (error) {
    console.error("Shipping rates error:", error);
    res.status(500).json({success: false, message: "Server error"});
  }
};
