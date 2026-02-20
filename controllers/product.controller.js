const Product = require("../models/Product");
const CustomError = require("../utils/CustomError");
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
    if (!image) {
      throw new CustomError("이미지를 등록해주세요.", true);
    }
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
      .json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
};

productController.getProducts = async (request, response) => {
  try {
    const { page, name } = request.query;
    const condition = name ? { name: {$regex: name, $options: "i" }} : {};
    let query = Product.find(condition);
    
    const products = await query.exec();
    response.status(200).json({ status: "success", data: products });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: false });
  }
}

module.exports = productController;
