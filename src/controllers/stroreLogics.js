import {addToCart} from "../../utils/addToCart.js";
import {Cart, Order, Product} from "../database/models/storeSchema.js";
import {User} from "../database/models/userSchema.js";

export const useStoreLogic = async (req, res) => {
  //allow the admin to create the products that they are selling
  const {name, description, price, stock, category} = req.body;
  const file = req.file;
  try {
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: "Appears that you are missing some required fileds !",
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
      message: "Creted the new product",
      deta: createdProducts,
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

//to allow the user to see the data for individual product after clicking on iit
export const getProductData = async (req, res) => {
  try {
    const requiredProduct = await Product.findById(req.params.id);

    if (
      !requiredProduct ||
      !requiredProduct.image ||
      !requiredProduct.image.data
    ) {
      return res.status(404).json({
        sucess: false,
        message: `The product with the id of ${id} cannot be retrieved !`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Here if the product you are looking for !",
      data: requiredProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      sucess: false,
      message: "Check the console for more info about the error message !",
    });
  }
};
//to allow the user to find a product by searching
export const getProductsSrch = async (req, res) => {
  const {q, category} = req.query;

  let filter = {};

  try {
    if (q) {
      filter.name = {$regex: q, $options: "i"};
    } else {
      return res.status(404).json({
        sucess: false,
        message: `No products with the name of ${q} are found in the DB !`,
        data: null,
      });
    }

    if (category) {
      filter.category = category;
    }
    const searchedProducts = await Product.find(filter);

    if (!q) {
      return res.status(400).json({
        sucess: false,
        message: "Missing required search field !",
      });
    }

    res.status(200).json({
      sucess: false,
      message: "Here are the products that you were looking for ",
      data: searchedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "There was a problem somewhere in the code , check the console for more info about the error !",
      data: null,
    });
  }
};

//CRUD operations for shopping cart algorithms

//PUT/UPDATE CART
export const updateCart = async (req, res) => {
  try {
    const {productId, quantity = 1} = req.body;
    //checking if  user is logged in or not
    const ownerField = req.user ? "user" : "sessionId";
    const ownerValue = req.user ? req.user.id : req.session.id;

    const cart = await addToCart(ownerField, ownerValue, productId, quantity);
    res.status(200).json({
      sucess: true,
      message: "Succesfully updated the cart section",
      data: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      sucess: false,
      message: "Check console for more info about the error !",
      data: null,
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email,
      firstName,
      lastName,
      subCounty,
      ward,
      streetAddress,
      paymentMethod,
      phoneNumber,
    } = req.body;

    const cart = await Cart.findOne({user: userId, status: "active"}).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({success: false, message: "Cart is empty"});
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
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
        image: product.images?.[0] || null,
      });
      subtotal += item.priceAtAdd * item.quantity;
    }

    const shippingFee = 5.0;
    const total = subtotal + shippingFee;

    const orderData = {
      user: userId,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      shippingAddress: {
        email,
        firstName,
        lastName,
        subCounty,
        ward,
        streetAddress,
        phoneNumber,
      },
      paymentStatus: "pending",
      paymentMethod: paymentMethod,
      orderStatus: "processing",
    };

    const order = await Order.create(orderData);

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {stock: -item.quantity},
      });
    }

    cart.status = "converted";
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({success: false, message: "Server error"});
  }
};

export const checkOut = async (req, res) => {
  //get all the required data
  //Initiation of payments
};
