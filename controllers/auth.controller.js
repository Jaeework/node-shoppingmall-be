const User = require("../models/User");
const bcrypt = require("bcryptjs");
const CustomError = require("../utils/CustomError")

const authController = {};

authController.loginWithEmail = async (request, response) => {
  try {
    let { email, password } = request.body;
    const user = await User.findOne({ email });
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = user.generateToken();
        return response.status(200).json({ status: "success", user, token });
      }
    }
    throw new CustomError("이메일 또는 비밀번호를 다시 확인해주세요.");
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message });
  }
}

module.exports = authController;
