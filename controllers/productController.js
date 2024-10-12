const Product = require("../models/Product");

const createProduct = async (req, res) => {
  const { name, description, image, category, price } = req.body;
  try {
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({ message: "Product already exists" });
    }
    const newProduct = new Product({
      name,
      description,
      image,
      category,
      price,
    });
    await newProduct.save();
    return res.status(201).json({ message: "Product creation successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // request query'den categoryId'yi alıyoruz
    const { categoryId } = req.query;

    // Eğer categoryId varsa, bu id'ye göre filtreleme yapıyoruz
    let filter = {};
    if (categoryId) {
      filter = { category: categoryId }; // Kategorilere göre filtrele
    }

    // Filtreleme koşuluna göre ürünleri getiriyoruz
    const products = await Product.find(filter).sort("-createdAt");

    return res.status(200).json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to retrieve products: ${error}` });
  }
};

const getProduct = async (req, res) => {
  console.log("Request Params:", req.params); // Gelen parametreleri kontrol et
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to retrieve product: ${error}` });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params._id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to delete product: ${error}` });
  }
};

const updateProduct = async (req, res) => {
  const { name, description, category } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(
      req.params._id,
      { name, description, category },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to update product: ${error}` });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  getProduct,
};
