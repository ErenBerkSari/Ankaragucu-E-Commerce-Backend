const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: false, min: 1 },
      productName: { type: String },
      price: { type: Number },
      productImage: { type: String },
    },
  ],
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
