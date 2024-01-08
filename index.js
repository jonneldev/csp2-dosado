// Import necessary modules and routes
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");

// Create an Express application
const app = express();

// Set the port for the server to listen on
const port = process.env.PORT || 4000;

// Set the MongoDB URI for database connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://jonneldosadomain:admin123@cluster0.nnl816c.mongodb.net/ecommerce?retryWrites=true&w=majority";

// Middleware for parsing JSON and handling URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event handlers for successful and error MongoDB connections
mongoose.connection.on('open', () => {
  console.log("Connected to MongoDB Atlas.");
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// [SECTION] Backend Routes
// Mount user, product, order, and cart routes to specific paths
app.use("/b1/users", userRoutes);
app.use("/b1/products", productRoutes);
app.use("/b1/orders", orderRoutes);
app.use("/b1/cart", cartRoutes);

// [SECTION] Error Handling Middleware
// Middleware to handle errors and send a 500 status code with an error message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the Express server and listen on the specified port
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API is now online on port ${port}`);
  });
}

// Export the Express app and Mongoose for testing or external use
module.exports = { app, mongoose };
