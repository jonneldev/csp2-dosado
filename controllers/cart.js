
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Function to handle errors with logging
const handleError = (res, statusCode, message, error) => {
  console.error(`Error: ${message}`, error);
  res.status(statusCode).json({ success: false, error: "Internal Server Error" });
};

// Function to calculate the total amount of items in the cart
const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => {
    const itemTotalPrice = item.totalPrice || 0;
    return total + itemTotalPrice;
  }, 0);
};

// Controller to add products to the cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid products array" });
    }

    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'name price stock',
    }) || new Cart({ userId, items: [] });

    for (const { productId, quantity } of products) {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${productId} not found` });
      }

      // Check if there is sufficient stock for the ordered quantity
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}` });
      }

      cart.items.push({
        productId,
        quantity,
        productName: product.name,
        productPrice: product.price,
        totalPrice: product.price * quantity,
      });
    }
    
    cart.totalAmount = calculateTotalAmount(cart.items);

    await cart.save();

    res.status(201).json({ success: true, message: "Products added to the cart successfully", cart });
  } catch (error) {
    handleError(res, 500, "Error adding products to cart", error);
  }
};

// Controller to update a cart item
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { action, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItem = cart.items.find((item) => item.productId.equals(productId));

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not found in the cart" });
    }

    if (action === "update") {
      cartItem.quantity = quantity;
      cartItem.totalPrice = cartItem.productPrice * quantity;
    } else if (action === "increment") {
      cartItem.quantity += 1;
      cartItem.totalPrice = cartItem.productPrice * cartItem.quantity;
    } else if (action === "decrement") {
      cartItem.quantity = Math.max(cartItem.quantity - 1, 1);
      cartItem.totalPrice = cartItem.productPrice * cartItem.quantity;
    }

    cart.totalAmount = calculateTotalAmount(cart.items);

    await cart.save();

    res.status(200).json({ success: true, message: "Cart item updated successfully", cart });
  } catch (error) {
    handleError(res, 500, "Error updating cart item", error);
  }
};

// Controller to remove a product from the cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const initialCartLength = cart.items.length;

    cart.items = cart.items.filter((item) => !item.productId.equals(productId));

    if (cart.items.length === initialCartLength) {
      return res.status(404).json({ success: false, message: "Item not found in the cart" });
    }

    cart.totalAmount = calculateTotalAmount(cart.items);

    await cart.save();

    res.status(200).json({ success: true, message: "Product removed from the cart successfully", cart });
  } catch (error) {
    handleError(res, 500, "Error removing from cart", error);
  }
};

const getAllCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: "Product",
      select: "name price",
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(404).json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;

    const aggregatedItems = cart.items.reduce((acc, item) => {
      const existingItem = acc.find((aggItem) => aggItem.productId === item.productId);

      item.totalPrice = item.totalPrice || 0;

      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.totalPrice += item.totalPrice;
      } else {
        acc.push({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        });
      }

      totalAmount += item.totalPrice;

      return acc;
    }, []);

    res.status(200).json({ success: true, cartItems: aggregatedItems, totalAmount });
  } catch (error) {
    console.error("Error getting cart items:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};



module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getAllCartItems,
  // ... (Export other functions as needed)
};