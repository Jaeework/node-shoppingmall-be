const Cart = require("../models/Cart");
const CustomError = require('../utils/CustomError');

const cartController = {};

cartController.addItemToCart = async (request, response) => {
  try {
    const {userId} = request;
    const { productId, size, qty } = request.body;

    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = new Cart({userId});
      await cart.save();
    }

    const existingItem = cart.items.find((item) => item.productId.equals(productId) && item.size === size);
    if (existingItem) {
      throw new CustomError("상품이 이미 카트에 담겨 있습니다.", true);
    }

    cart.items = [...cart.items, {productId, size, qty}];
    await cart.save();

    response.status(200).json({ status: "success", data: cart, cartItemQuantity: cart.items.length });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });    
  }
}

cartController.getCart = async (request, response) => {
  try {
    const { userId } = request;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    response.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });    
  }
}

module.exports = cartController;
