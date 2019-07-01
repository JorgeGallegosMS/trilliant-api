"use strict";

const jwt = require("jsonwebtoken");
const {
  JWT_SECRET_RESET_PSW,
  JWT_SECRET_LOGIN,
  JWT_SECRET_REFRESH_LOGIN,
  JWT_EXP_LOGIN,
  JWT_EXP_REFRESH,
  JWT_EXP_RESET_PSW
} = require("../constants/jwt");
const CustomError = require("../libs/custom-error.lib");

module.exports = event => {
  let secret, exp;
  switch (event) {
    case "resetPsw":
      secret = JWT_SECRET_RESET_PSW;
      exp = JWT_EXP_RESET_PSW;
      break;
    case "login":
      secret = JWT_SECRET_LOGIN;
      exp = JWT_EXP_LOGIN;
      break;
  }

  return {
    sign: async payload => {
      try {
        const token = await jwt.sign(payload, secret || "secret", { expiresIn: exp });
        return token;
      } catch (err) {
        throw new CustomError({
          message: "signing token error",
          code: 400
        });
      }
    },

    signRefreshToken: async payload => {
      try {
        const token = await jwt.sign(payload, JWT_SECRET_REFRESH_LOGIN || "secret", { expiresIn: JWT_EXP_REFRESH });
        return token;
      } catch (err) {
        throw new CustomError({
          message: "signing refreshToken error",
          code: 400
        });
      }
    },

    verify: async token => {
      try {
        const decoded = await jwt.verify(token, secret || "secret");
        return decoded;
      } catch (err) {
        throw new CustomError({
          message: "error verifying local token",
          code: 401,
          customCode: "305"
        });
      }
    }
  };
};
