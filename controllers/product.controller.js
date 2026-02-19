const Product = require("../models/Product");
const productController = {};

productController.createProduct = async (request, response) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = request.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    response.status(200).json({ status: "success", product });
  } catch (error) {
    response
      .status(400)
      .json({ status: "fail", message: error.message, isUserError: false });
  }
};

productController.getProducts = async (request, response) => {
  try {
    const products = await Product.find({});
    response.status(200).json({ status: "success", data: products });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: false });
  }
}

module.exports = productController;
