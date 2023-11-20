// Import necessary models
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
    const itemPrice = item.price || 0; // Use 0 if item.price is not defined
    return total + item.quantity * itemPrice;
  }, 0);
};

// Controller to add products to the cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products } = req.body;

    // Validate the products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid products array" });
    }

    // Find the user's cart or create a new one if not exists
    let cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    // Loop through the products and add them to the cart
    for (const { productId, quantity } of products) {
      const product = await Product.findById(productId);

      // Check if the product exists
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${productId} not found` });
      }

      cart.items.push({ productId, quantity, price: product.price });
    }

    // Save the updated cart to the database
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
    const { quantity } = req.body;
    const userId = req.user.id;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // Check if the cart exists
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Find the cart item to be updated
    const cartItem = cart.items.find((item) => item.productId.equals(productId));

    // Check if the cart item exists
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not found in the cart" });
    }

    // Update the quantity of the cart item
    cartItem.quantity = quantity;

    // Recalculate the total amount of the cart
    cart.totalAmount = calculateTotalAmount(cart.items);

    // Save the updated cart to the database
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

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // Check if the cart exists
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Store the initial length of the cart items
    const initialCartLength = cart.items.length;

    // Remove the product from the cart items
    cart.items = cart.items.filter((item) => !item.productId.equals(productId));

    // Check if the product was found in the cart items
    if (cart.items.length === initialCartLength) {
      return res.status(404).json({ success: false, message: "Item not found in the cart" });
    }

    // Recalculate the total amount of the cart
    cart.totalAmount = calculateTotalAmount(cart.items);

    // Save the updated cart to the database
    await cart.save();

    res.status(200).json({ success: true, message: "Product removed from the cart successfully", cart });
  } catch (error) {
    handleError(res, 500, "Error removing from cart", error);
  }
};

// Controller to retrieve all cart items for a user
const getAllCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's cart and populate the product details
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    // Check if the cart exists
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, cartItems: cart.items });
  } catch (error) {
    handleError(res, 500, "Error getting cart items", error);
  }
};

// Exporting all the functions as part of the module
module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getAllCartItems,
  // ... (Export other functions as needed)
};
