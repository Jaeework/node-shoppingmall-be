const express = require("express");
const router = express.Router();
const userApi = require("./user.api");


router.use("/users", userApi);

module.exports = router;
