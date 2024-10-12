const express = require("express");
const {
  createCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("/addCategory", createCategory);
router.get("/deleteCategory/:id", deleteCategory);
router.get("/getAllCategories", getAllCategories);

module.exports = router;
