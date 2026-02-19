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
    throw new CustomError("이메일 또는 비밀번호를 다시 확인해주세요.", true);
  } catch (error) {
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
}

authController.authenticate = async (request, response, next) => {
  try {
    const tokenString = request.headers.authorization;
    if (!tokenString) {
      throw new CustomError("인증 토큰이 없습니다.");
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        throw new CustomError("유효하지 않은 토큰입니다.");;
      }
      request.userId = payload._id;
      next();
    });
  } catch (error) {
    console.log(`server error : `, error);
    response.status(400).json({ status: "fail", message: error.message, isUserError: error.isUserError || false });
  }
}

authController.checkAdminPermission = async (request, response, next) => {
  try {
    const { userId } = request;
    const user = await User.findOne({ _id: userId });
    if (user.level !== "admin") {
      throw new CustomError("권한이 존재하지 않습니다.", true);
    }
    next();
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error.message,
      isUserError: error.isUserError || false
    })    
  }
}

module.exports = authController;
