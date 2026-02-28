const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/", authController.authenticate, cartController.getCart);
router.put("/:id", authController.authenticate, cartController.updateQuantity);
router.delete("/", authController.authenticate, cartController.deleteCartItems);
router.get("/qty", authController.authenticate, cartController.getCartItemQuantity);

module.exports = router;
