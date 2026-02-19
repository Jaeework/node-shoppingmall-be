class CustomError extends Error {
  constructor(message) {
    super(message);
    this.isUserError = false;
  }
}

module.exports = CustomError;
