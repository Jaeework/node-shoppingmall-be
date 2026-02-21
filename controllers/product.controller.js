const Product = require("../models/Product");
const CustomError = require("../utils/CustomError");
const productController = {};

const PAGE_SIZE = 5;
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
    const condition = name ? {name: { $regex: name, $options: "i" }} : {};
    condition.isDeleted = false;
    let query = Product.find(condition);
    let responseJson = { status: "success" };
    if (page) {
      query.skip((page-1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.find(condition).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      responseJson.totalPageNum = totalPageNum;
    }
    
    const products = await query.exec();
    responseJson.data = products;
    response.status(200).json(responseJson);
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
};

productController.updateProduct = async (request, response) => {
  try {
    const productId = request.params.id;
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
    const product = await Product.findByIdAndUpdate({_id: productId}, {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,}, {new: true});
      if (!product) throw new CustomError("아이템이 존재하지 않습니다.", true);
      response.status(200).json({status: "success", data: product});
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
};

productController.deleteProduct = async (request, response) => {
  try {
    const productId = request.params.id;
    const product = await Product.findByIdAndUpdate({_id: productId}, {isDeleted: true}, {new: true});

    if (!product) throw new CustomError("아이템이 존재하지 않습니다.", true);

    response.status(200).json({status: "success", data: product});
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
}

module.exports = productController;
