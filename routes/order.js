const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const auth = require("../auth");

// Destructuring the verify and verifyAdmin functions from the auth module
const { verify, verifyAdmin } = auth;

// Creating order
router.post("/", verify, orderController.checkout);

// Retrieve order 
router.get("/", verify, orderController.getOrders);

// Cancel order 
router.delete("/:orderId", verify, orderController.cancelOrder);

// Retrieve all order (Admin only)
router.get("/all", verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;
