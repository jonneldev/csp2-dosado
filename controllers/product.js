// Import necessary models
const Product = require("../models/Product");
const User = require("../models/User");

// Function to send error response with logging
const sendErrorResponse = (res, statusCode, error) => {
  console.error("Error:", error);
  res.status(statusCode).json({ success: false, error: error.message });
};

// Controller for creating a product
const createProduct = async (req, res) => {
  try {
    // Extracting data from the request body
    const { name, description, price, stock } = req.body;

    // Creating a new product instance
    const product = new Product({ name, description, price, stock });

    // Saving the product to the database
    await product.save();

    // Sending success response
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller for getting all products
const getAllProducts = async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller for only getting the active products
const getActiveProducts = async (req, res) => {
  try {
    // Retrieve active products from the database
    const activeProducts = await Product.find({ isActive: true });
    res.status(200).json({ success: true, activeProducts });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller for getting a single product
const getSingleProduct = async (req, res) => {
  try {
    // Retrieve product ID from request parameters
    const productId = req.params.productId;

    // Find the product by ID in the database
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller for updating a product (Admin only)
const updateProduct = async (req, res) => {
  try {
    // Retrieve product ID and updated product information from the request
    const productId = req.params.productId;
    const { name, description, price, isActive, stock } = req.body;

    // Update the product in the database and get the updated product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, isActive, stock },
      { new: true }
    );

    // Check if the product exists
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated successfully", updatedProduct });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller for archiving a product
const archiveProduct = async (req, res) => {
  try {
    // Retrieve product ID from request parameters
    const productId = req.params.productId;

    // Archive the product in the database and get the archived product
    const archivedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );

    // Check if the product exists
    if (!archivedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product archived successfully", archivedProduct });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller for activating a product
const activateProduct = async (req, res) => {
  try {
    // Retrieve product ID from request parameters
    const productId = req.params.productId;

    // Activate the product in the database and get the activated product
    const activatedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive: true },
      { new: true }
    );

    // Check if the product exists
    if (!activatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product activated successfully", activatedProduct });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Controller function to remove a product
const removeProduct = async (req, res) => {
  try {
    // Retrieve product ID from request parameters
    const productId = req.params.productId;

    // Delete the product from the database
    const deletedProduct = await Product.findByIdAndDelete(productId);

    // If product not found, send error response; otherwise, send success response
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};

// Exporting all the functions as part of the module
module.exports = {
  createProduct,
  getAllProducts,
  getActiveProducts,
  getSingleProduct,
  updateProduct,
  archiveProduct,
  activateProduct,
  removeProduct, // Add the removeProduct function
  // ... (Export other functions as needed)
};

