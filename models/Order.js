const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
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
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  purchasedOn: {
    type: Date,
    default: new Date(),
  },
});

// Calculate total amount based on products and quantities
orderSchema.pre("save", async function (next) {
  try {
    this.totalAmount = await this.calculateTotalAmount();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to calculate total amount
orderSchema.methods.calculateTotalAmount = async function () {
  const Product = mongoose.model("Product");

  return (await Promise.all(
    this.products.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return product.price * item.quantity;
    })
  )).reduce((acc, curr) => acc + curr, 0);
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
