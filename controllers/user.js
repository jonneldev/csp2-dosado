// Import necessary modules and authentication middleware
const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");

// Function to send error response with logging
const sendErrorResponse = (res, statusCode, message) => {
  console.error("Error:", message);
  res.status(statusCode).json({ success: false, message });
};

// Function to send success response
const sendSuccessResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({ success: true, message, data });
};

// Controller function to register a new user
const registerUser = async (req, res) => {
  try {
    // Check if the email already exists in the database
    const emailExists = await User.exists({ email: req.body.email });

    if (emailExists) {
      return sendErrorResponse(res, 400, 'Email already exists');
    }

    // Hash the user's password before saving it to the database
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user with hashed password and save to the database
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      address: req.body.address,
      password: hashedPassword,
    });

    const user = await newUser.save();
    sendSuccessResponse(res, 201, 'User registration successful', user);
  } catch (error) {
    sendErrorResponse(res, 500, 'User registration failed');
  }
};

// Controller function to authenticate and log in a user
const loginUser = async (req, res) => {
  try {
    // Find the user by email in the database
    const user = await User.findOne({ email: req.body.email });

    // Check if the user exists and the password is correct
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    // Generate an access token for the authenticated user
    const accessToken = auth.createAccessToken(user);
    sendSuccessResponse(res, 200, 'Authentication successful', { accessToken });
  } catch (error) {
    sendErrorResponse(res, 500, 'Authentication failed');
  }
};

// Controller function to get the user's profile
const getProfile = async (req, res) => {
  try {
    // Retrieve the user's profile based on the user ID in the request
    const user = await User.findById(req.user.id);
    // Remove password field from the response for security
    user.password = "";
    sendSuccessResponse(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    sendErrorResponse(res, 500, 'Error retrieving profile');
  }
};

// Controller function to reset the user's password
const resetPassword = async (req, res) => {
  try {
    // Retrieve new password and user ID from the request
    const { newPassword } = req.body;
    const { id } = req.user;

    // Hash the new password and update the user's password in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    sendSuccessResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Internal server error');
  }
};

// Controller function to update the user profile
const updateProfile = async (req, res) => {
  try {
    // Retrieve user ID and updated profile information from the request
    const userId = req.user.id;
    const { firstName, lastName, mobileNo, address } = req.body;

    // Update the user's profile in the database and get the updated user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo, address },
      { new: true }
    );

    sendSuccessResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to update profile');
  }
};

// Controller function to set a user as admin
const setAdmin = async (req, res) => {
  try {
    // Retrieve the user ID to promote to admin from the request parameters
    const userIdToPromote = req.params.userId;

    // Update the user's status to admin in the database and get the updated user
    const updatedUser = await User.findByIdAndUpdate(
      userIdToPromote,
      { isAdmin: true },
      { new: true }
    );

    // If user not found, send error response; otherwise, send success response
    if (!updatedUser) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'User set as admin successfully', { user: updatedUser });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

// Controller function to remove the user's account
const removeAccount = async (req, res) => {
  try {
    // Retrieve user ID from the authenticated user
    const userId = req.user.id;

    // Delete the user from the database
    const deletedUser = await User.findByIdAndDelete(userId);

    // If user not found, send error response; otherwise, send success response
    if (!deletedUser) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'Account removed successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to remove account');
  }
};

// Exporting all the functions as part of the module
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  resetPassword,
  updateProfile,
  setAdmin,
  removeAccount, // Add the removeAccount function
  // ... (Export other functions as needed)
};
