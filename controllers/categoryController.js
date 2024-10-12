const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await Category.findOne({ name });
  try {
    if (category) {
      return res
        .status(400)
        .json({ message: "Category name has already been declared" });
    }
    const newCategory = await Category.create({
      name,
    });
    return res
      .status(201)
      .json({ message: "Category created successfully", newCategory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to create category: ${error}` });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params._id });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to delete category: ${error}` });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to retrieve categories: ${error}` });
  }
};
module.exports = {
  createCategory,
  deleteCategory,
  getAllCategories,
};
