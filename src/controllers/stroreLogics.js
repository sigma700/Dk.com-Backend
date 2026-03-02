import {Product} from "../database/models/storeSchema.js";

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

export const getProductData = async (req, res) => {
  //lets check the product id at this section with also the image data finding made possible

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
