const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const auth = require("../auth");

// Destructuring the verify and verifyAdmin from auth
// You can still use auth.verify, auth.verifyAdmin if you don't want destructuring
const { verify, verifyAdmin } = auth;

// Route for user registration
router.post("/register", userController.registerUser);

// Route for user Authentication
router.post("/login", userController.loginUser);

// Retrieve user details 
router.get("/details", verify, userController.getProfile);

// POST route for resetting the password
router.post("/reset-password", verify, userController.resetPassword);

// Update user profile route
router.put("/profile", verify, userController.updateProfile);

// Set user as admin (Admin only)
router.put('/set-admin/:userId', verify, verifyAdmin, userController.setAdmin);

// Remove user acount 
router.delete("/", verify, userController.removeAccount);

// Exporting the router for use in other parts of the application
module.exports = router;
