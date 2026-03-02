import {Product} from "../database/models/storeSchema.js";

export const useStoreLogic = async (req, res) => {
  //allow the admin to create the products that they are selling
  const {name, description, price, stock} = req.body;
  const file = req.file;
  try {
    if (!name || !description || !price || stock) {
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
