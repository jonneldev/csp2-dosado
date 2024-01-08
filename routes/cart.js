// routes/cart.js
const express = require("express");
const router = express.Router();
const auth = require("../auth");
const cartController = require("../controllers/cart");

const { verify, verifyAdmin } = auth;

// Route to add a product to the user's cart
router.post("/", verify, cartController.addToCart);

// Route to update the quantity of a product in the user's cart
router.put("/:productId", verify, cartController.updateCartItem);

// Route to remove a product from the user's cart
router.delete("/:productId", verify, cartController.removeFromCart);

// Route to get all products in the user's cart
router.get("/all", verify, cartController.getAllCartItems);


module.exports = router;
