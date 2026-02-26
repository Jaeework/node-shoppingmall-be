const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  shipTo: {type: Object, required: true},
  contact: {type: Object, required: true},
  totalPrice: {type: Number, default:0, required: true},
  userId: {type: mongoose.ObjectId, ref: User},
  status: {type: String, default: "preparing"},
  items: [{
    productId: {type: mongoose.ObjectId, ref: Product},
    size: {type: String, required: true},
    price: {type: Number, required: true},
    qty: {type: Number, default: 1, required: true},
  }],
  orderNum: {type: String},
}, {timestamps: true});

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;

  return obj;
}
orderSchema.post("save", async function () {
  const cart = await Cart.findOne({userId: this.userId});
  cart.items = [];
  await cart.save();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
