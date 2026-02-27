const Order = require("../models/Order");
const CustomError = require("../utils/CustomError");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

orderController = {};

const ADMIN_PAGE_SIZE = 3;
const PAGE_SIZE = 5;

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

orderController.getOrders = async (request, response) => {
  try {
    const { page, ordernum } = request.query;
    const condition = ordernum ? {orderNum: { $regex: ordernum, $options: "i" }} : {};
    let query = Order.find(condition).populate("userId").populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    }).sort({createdAt: -1});
    let responseJson = { status: "success" };
    if (page) {
      query.skip((page-1) * ADMIN_PAGE_SIZE).limit(ADMIN_PAGE_SIZE);
      const totalItemNum = await Order.find(condition).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / ADMIN_PAGE_SIZE);
      responseJson.totalPageNum = totalPageNum;
    }
    const orders = await query.exec();
    responseJson.data = orders;
    response.status(200).json(responseJson);
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error.message,
      isUserError: error.isUserError || false,
    });
  }
};

orderController.updateOrderStatus = async (request, response) => {
  try {
    const orderId = request.params.id;
    const { status } = request.body;
    const order = await Order.findByIdAndUpdate({_id: orderId}, {status}, {new: true});

    if (!order) throw new CustomError("해당 주문 정보가 존재하지 않습니다.", true);

    response.status(200).json({status: "success", data: order});
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error.message,
      isUserError: error.isUserError || false,
    });
  }
}

orderController.getOrdersByUserId = async (request, response) => {
  try {
    const { userId } = request;
    const { page } = request.query;
    let query = Order.find({userId}).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    }).sort({createdAt: -1});
    let responseJson = { status: "success" };
    if (page) {
      query.skip((page-1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Order.find({userId}).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      responseJson.totalPageNum = totalPageNum;
    }
    const orders = await query.exec();
    responseJson.data = orders;
    response.status(200).json(responseJson);
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error.message,
      isUserError: error.isUserError || false,
    });
  }
}

module.exports = orderController;
