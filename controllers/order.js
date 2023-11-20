// Import necessary models and modules
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const auth = require("../auth");
const mongoose = require("mongoose");

// Controller to handle the checkout process
const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { products } = req.body;
    const userId = req.user.id;

    // Retrieve product details and perform validation for each product in the order
    const productsDetails = await Promise.all(
      products.map(async ({ productId, quantity }) => {
        const product = await Product.findById(productId);

        // Check if the product exists
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        // Check if there is sufficient stock for the ordered quantity
        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const productPrice = product.price;
        const totalPrice = productPrice * quantity;

        // Deduct the ordered quantity from the available stock
        product.stock -= quantity;
        await product.save();

        return {
          productId: product._id,
          productName: product.name,
          productPrice,
          quantity,
          totalPrice,
        };
      })
    );

    // Calculate the total amount for the order
    const totalAmount = productsDetails.reduce((total, { totalPrice }) => total + totalPrice, 0);

    // Create a new order instance and save it to the database
    const order = new Order({
      userId,
      products: productsDetails.map(({ productId, productName, productPrice, quantity, totalPrice }) => ({
        productId,
        productName,
        productPrice,
        quantity,
        totalPrice,
      })),
      totalAmount,
    });

    await order.save();

    // Commit the transaction and end the session
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: "Order created successfully", order });
  } catch (error) {
    // Rollback the transaction and end the session in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller to retrieve orders for a verified user
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Controller to retrieve all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    // Check if the user is an admin before retrieving all orders
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. User is not an admin" });
    }

    const allOrders = await Order.find();
    res.status(200).json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("Error retrieving all orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Exporting all the functions as part of the module
module.exports = {
  checkout,
  getOrders,
  getAllOrders,
  // ... (Export other functions as needed)
};
