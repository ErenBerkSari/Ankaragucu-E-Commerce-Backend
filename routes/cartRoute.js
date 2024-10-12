const express = require("express");
const {
  addToCart,
  removeFromCart,
  viewCart,
  clearCart,
  updateCartItemQuantity,
} = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/addToCart", authMiddleware, addToCart);
router.get("/viewCart", authMiddleware, viewCart);
router.delete("/removeFromCart", authMiddleware, removeFromCart);
router.put("/updateCartItemQuantity", authMiddleware, updateCartItemQuantity);
router.get("/clearCart", authMiddleware, clearCart);

module.exports = router;
