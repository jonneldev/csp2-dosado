const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: {
        type: String,
        ref: "Product",
      },
      productPrice: {
        type: Number,
      },
      quantity: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
      },
    },  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
});


const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
