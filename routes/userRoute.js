const express = require("express");
const {
  refresh,
  login,
  register,
  logout,
  sendEmail,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/send-email", authMiddleware, sendEmail);

module.exports = router;
