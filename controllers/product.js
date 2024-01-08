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



//-------------//
const updateProduct = async (req, res) => {
  try {
    // Specify the fields/properties of the document to be updated
    let updatedProduct = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock
    };

    // Syntax
    // findByIdAndUpdate(documentID, updatesToBeApplied, options)
    const result = await Product.findByIdAndUpdate(
      req.params.productId,
      updatedProduct,
      { new: true } // This option ensures that the updated document is returned
    );

    // Product not updated
    if (!result) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Product updated successfully
    res.status(200).json({ success: true, message: "Product updated successfully", updatedProduct: result });
  } catch (error) {
    // Sending error response in case of an exception
    sendErrorResponse(res, 500, error);
  }
};



const archiveProduct = (req, res) => {
  let updateActiveField = {
    isActive: false
  };
  console.log("Updating product with ID:", req.params.productId);
  Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then((product, error) => {
      console.log("Product updated:", product);
      if (error) {
        console.error("Error updating product:", error);
        return res.send(false);
      } else {
        return res.send(true);
      }
    })
    .catch((err) => {
      console.error("Catch block error:", err);
      res.send(err);
    });
};

const activateProduct = (req, res) => {

  let updateActiveField = {
    isActive: true
  }

  return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
  .then((product, error) => {

    if(error) {
      return res.send(false);

    } else {
      return res.send(true);
    }

  })
  .catch(err => res.send(err));
}

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

// Controller action to search for products by product name
const searchProductsByName = async (req, res) => {
  try {
    const { productName } = req.body;

    // Use a regular expression to perform a case-insensitive search
    const products = await Product.find({
      name: { $regex: productName, $options: 'i' }
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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
  removeProduct, 
  searchProductsByName// Add the removeProduct function
  // ... (Export other functions as needed)
};

