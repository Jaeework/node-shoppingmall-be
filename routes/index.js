const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const productApi = require("./product.api");

router.use("/users", userApi);
router.use("/auth", authApi);
router.use("/products", productApi);

module.exports = router;
