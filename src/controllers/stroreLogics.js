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

//logic for getting an image in a products page

// export const getImage = async (req, res) => {
//   try {
//     const products = await Product.findById(req.params.id);

//     if (!product || !product.image || !product.image.data) {
//       return res.status(404).json({
//         message: "Could not find the image data !",
//       });
//       res.set("Content-Type", product.image.contentType);
//       res.send(product.image.data);
//     }
//   } catch {
//     res.status(500).json({
//       sucess: false,
//       message: "Could not find the image",
//     });
//   }
// };
