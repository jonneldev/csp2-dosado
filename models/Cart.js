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
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
});

// Calculate total amount based on items and quantities
cartSchema.pre("save", async function (next) {
  try {
    this.totalAmount = await this.calculateTotalAmount();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to calculate total amount
cartSchema.methods.calculateTotalAmount = async function () {
  const Product = mongoose.model("Product");

  return (await Promise.all(
    this.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return product.price * item.quantity;
    })
  )).reduce((acc, curr) => acc + curr, 0);
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
