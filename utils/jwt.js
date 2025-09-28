// utils/jwt.js
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    return null; // Token tidak valid atau expired
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
