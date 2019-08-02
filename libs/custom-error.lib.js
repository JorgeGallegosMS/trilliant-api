'use strict';

class CustomError extends Error {
  constructor({ message: msg, code = 500, customCode }) {
    super(msg);
    this.name = this.constructor.name;
    this.msg = msg;
    this.code = code;
    this.customCode = customCode;
  }
}

module.exports = CustomError;
