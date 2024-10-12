const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const router = express.Router();

router.post("/addProduct", createProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getProduct/:productId", getProduct);
router.delete("/deleteProduct/:id", deleteProduct);
router.put("/updateProduct/:id", updateProduct);

module.exports = router;
