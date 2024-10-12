const Cart = require("../models/Cart");
const mongoose = require("mongoose");

// Sepete Ürün Ekle
const addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Verilerin doğruluğunu kontrol et
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "User ID and items are required" });
    }

    // userId ve productId'lerin geçerli ObjectId olup olmadığını kontrol et
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      if (!item.productName || typeof item.productName !== "string") {
        return res.status(400).json({ message: "Invalid product name" });
      }
      if (typeof item.price !== "number" || item.price <= 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      if (!item.productImage || typeof item.productImage !== "string") {
        return res.status(400).json({ message: "Invalid product image" });
      }
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    items.forEach((item) => {
      const itemIndex = cart.items.findIndex(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString() // Burada productId'leri string'e çeviriyoruz
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += item.quantity;
      } else {
        // Yeni ürün ekliyoruz, productName ve productImage'i de kaydediyoruz
        cart.items.push({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          productImage: item.productImage,
        });
      }
    });

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding product to cart:", error); // Hata detayını logla
    res
      .status(500)
      .json({ message: `Failed to add product to cart: ${error.message}` });
  }
};

const viewCart = async (req, res) => {
  const userId = req.user ? req.user.userId : null; // req.user kontrolü
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User not logged in." });
  }

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      // Eğer sepet boşsa uygun bir yanıt döndür
      return res.status(204).json({ message: "Sepetiniz boş." }); // veya 204 No Content
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res
      .status(500)
      .json({ message: `Failed to retrieve cart: ${error.message}` });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.headers.userid;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: "User ID and Product ID are required." });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(204).json({ message: "Sepetiniz boş." });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    const updatedCart = await cart.save();
    return res
      .status(200)
      .json({ message: "Product removed from cart", cart: updatedCart });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to remove product from cart: ${error.message}`,
    });
  }
};

// Sepetteki Ürün Adedini Güncelle
const updateCartItemQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  console.log("Gelmiyor mu amk:", productId, quantity);

  const userId = req.user.userId;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId == productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      return res
        .status(200)
        .json({ message: "Cart item quantity updated", cart });
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to update cart item: ${error}` });
  }
};

// Sepeti Temizle
const clearCart = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOneAndDelete({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to clear cart: ${error}` });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
  clearCart,
  updateCartItemQuantity,
};
