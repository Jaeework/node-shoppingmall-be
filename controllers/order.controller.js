const Order = require("../models/Order");
const CustomError = require("../utils/CustomError");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

orderController = {};

orderController.createOrder = async (request, response) => {
  try {
    const { userId } = request;
    const { shipTo, contact, totalPrice, orderList } = request.body;

    const inSufficientStockItems =
      await productController.checkItemListStock(orderList);
    if (inSufficientStockItems.length > 0) {
      const errorMessage = inSufficientStockItems.reduce(
        (total, item) => (total += item.message),
        "",
      );
      throw new CustomError(errorMessage, true);
    }

    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: `ODN-${randomStringGenerator()}`,
    });

    await newOrder.save();
    response
      .status(200)
      .json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error.message,
      isUserError: error.isUserError || false,
    });
  }
};

module.exports = orderController;
