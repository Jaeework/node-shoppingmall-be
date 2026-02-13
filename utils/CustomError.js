class CustomError extends Error {
  constructor(message) {
    super(message);
    this.isUserError = true;
  }
}

module.exports = CustomError;
