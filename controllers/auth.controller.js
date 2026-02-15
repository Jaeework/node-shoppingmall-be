const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/CustomError");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

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

authController.authenticate = async (request, response, next) => {
  try {
    const tokenString = request.headers.authorization;
    if (!tokenString) {
      const error = new CustomError("인증 토큰이 없습니다.");
      error.isUserError = false;
      throw error;
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        const error = new CustomError("유효하지 않은 토큰입니다.");
        error.isUserError = false;
        throw error;
      }
      request.userId = payload._id;
      next();
    });
  } catch (error) {
    console.log(`server error : `, error);
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
}

module.exports = authController;
