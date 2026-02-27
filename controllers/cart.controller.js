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

    response.status(200).json({ status: "success", data: cart.getActiveItems() });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });    
  }
}

cartController.updateQuantity = async (request, response) => {
  try {
    const { userId } = request;
    const { id } = request.params;
    const { qty } = request.body;

    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart) throw new ApiError("카트가 존재하지 않습니다.", false);

    const index = cart.items.findIndex((item) => item._id.equals(id));
    if (index === -1) throw new CustomError("상품이 카트에 존재하지 않습니다.", false);

    cart.items[index].qty = qty;
    await cart.save();

    response.status(200).json({ status: "success", data: cart.getActiveItems() });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
}

cartController.deleteCartItem = async (request, response) => {
  try {
    const { userId } = request;
    const { id } = request.params;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
        select: "status",
      },
    });
    cart.items = cart.items.filter((item) => !item._id.equals(id));

    await cart.save();

    response.status(200).json({ status: "success", cartItemQuantity: cart.getActiveItems().length });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
}

cartController.getCartItemQuantity = async (request, response) => {
  try {
    const { userId } = request;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
        select: "status",
      },
    });
    if (!cart) throw new ApiError("카트가 존재하지 않습니다.", false);
    
    response.status(200).json({ status: "success", cartItemQuantity: cart.getActiveItems().length });
  } catch (error) {
    console.log("error : ", error);
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });    
  }
}

module.exports = cartController;
