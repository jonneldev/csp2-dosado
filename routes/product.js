const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const auth = require("../auth");

// Destructuring the verify and verifyAdmin functions from the auth module
const { verify, verifyAdmin } = auth;

// Create a new product (Admin only)
router.post("/", verify, verifyAdmin, productController.createProduct);

// Retrieve all products
router.get("/", productController.getAllProducts);

// Retrieve active products
router.get("/active", productController.getActiveProducts);

// Retrieve a single product
router.get("/:productId", productController.getSingleProduct);

// Update product information (Admin only)
router.put("/:productId", verify, verifyAdmin, productController.updateProduct);

// Archive product (Admin only)
router.put("/:productId", verify, verifyAdmin, productController.archiveProduct);

// Activating product (Admin only)
router.put("/:productId", verify, verifyAdmin, productController.activateProduct);

// Remove product (Admin only)
router.delete("/:productId", verify, verifyAdmin, productController.removeProduct);

// Exporting the router for use in other parts of the application
module.exports = router;
