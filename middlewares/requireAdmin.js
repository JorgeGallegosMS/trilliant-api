const errorHandler = require("../services/error-handler.service");
const userService = require("../services/user.service")

module.exports = async function requireAdmin(req, res, next) {
      const userId = req.decodedToken._id;
      const user = await userService.getUserById(userId);
  console.log('user', user)
  if (user.isAdmin) return next();
  errorHandler("You do not have the right to access this route", req, res);
};
