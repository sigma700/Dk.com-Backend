import {addToCart} from "../../utils/addToCart.js";
import {Cart, Product} from "../database/models/storeSchema.js";

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
