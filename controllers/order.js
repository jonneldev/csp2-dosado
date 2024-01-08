const mongoose = require("mongoose");
const auth = require("../auth");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const handleError = (res, statusCode, message, error) => {
  console.error(`Error: ${message}`, error);
  res.status(statusCode).json({ success: false, error: "Internal Server Error" });
};

const updateOrderStatus = (orderId, newStatus, delay) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Order.findByIdAndUpdate(orderId, { $set: { status: newStatus } })
        .then(() => resolve())
        .catch((error) => {
          console.error(`Error updating order status to ${newStatus}:`, error);
          resolve();
        });
    }, delay);
  });
};

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      console.error("Error: Cart not found or empty");
      return res.status(404).json({ success: false, message: "Cart not found or empty" });
    }

    console.log("Request Body:", req.body);

    const totalAmount = cart.items.reduce((total, { totalPrice }) => total + totalPrice, 0);

    const order = new Order({
      userId,
      products: cart.items.map(({ productId, productName, productPrice, quantity, totalPrice }) => ({
        productId,
        productName,
        productPrice,
        quantity,
        totalPrice,
      })),
      totalAmount,
      status: "pending",
    });

    await order.save();

    await updateOrderStatus(order._id, "processing", 6);
    await updateOrderStatus(order._id, "shipped", 12);

    try {
      const selectedProductIds = req.body.products.map((item) => item.productId);

      const updatedCartItems = cart.items.filter(
        (item) => !selectedProductIds.includes(item.productId.toString())
      );
      cart.items = updatedCartItems;

      await cart.save();

      console.log("Updated Cart Items:", cart.items);
    } catch (error) {
      console.error("Error removing items from the cart:", error);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ success: false, error: "Error removing items from the cart" });
    }

    await session.commitTransaction();
    session.endSession();

    console.log("Order placed successfully");

    res.status(201).json({ success: true, message: "Order created successfully", cartItems: cart.items });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, 500, "Error creating order", error);
  }
};


// Controller to retrieve orders for a verified user (excluding canceled orders)
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId, status: { $ne: "canceled" } });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Controller to retrieve all orders (admin only, excluding canceled orders)
const getAllOrders = async (req, res) => {
  try {
    // Check if the user is an admin before retrieving all orders
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. User is not an admin" });
    }

    const allOrders = await Order.find({ status: { $ne: "canceled" } });
    res.status(200).json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("Error retrieving all orders:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Controller to cancel an order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id;

    // Find the order by ID and check if the user has permission to cancel
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. User cannot cancel this order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Order cannot be canceled. Status is not pending" });
    }

    // Add ordered quantities back to product stock
    await Promise.all(
      order.products.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        product.stock += item.quantity;
        await product.save();
      })
    );

    // Update order status to "canceled"
    await Order.findByIdAndUpdate(orderId, { $set: { status: "canceled" } });

    res.status(200).json({ success: true, message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Exporting all the functions as part of the module
module.exports = {
  placeOrder,
  getOrders,
  getAllOrders,
  cancelOrder,
  // Add the new controller
  // ... (Export other functions as needed)
};