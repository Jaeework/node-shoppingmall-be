const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (request, response) => {
  try {
    let { email, password, name, level } = request.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 가입된 유저입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    return response.status(200).json({ status: "success" });
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = userController;
