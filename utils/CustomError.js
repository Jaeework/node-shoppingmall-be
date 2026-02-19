class CustomError extends Error {
  constructor(message, isUserError) {
    super(message);
    this.isUserError = isUserError || false;
  }
}

module.exports = CustomError;
