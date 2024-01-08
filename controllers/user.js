// controllers/user.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");

const sendErrorResponse = (res, statusCode, message) => {
  console.error("Error:", message);
  res.status(statusCode).json({ success: false, message });
};

const sendSuccessResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({ success: true, message, data });
};

const registerUser = async (req, res) => {
  try {
    const emailExists = await User.exists({ email: req.body.email });

    if (emailExists) {
      return sendErrorResponse(res, 400, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

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

const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    const accessToken = auth.createAccessToken(user);
    sendSuccessResponse(res, 200, 'Authentication successful', { accessToken });
  } catch (error) {
    sendErrorResponse(res, 500, 'Authentication failed');
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.password = "";
    sendSuccessResponse(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    sendErrorResponse(res, 500, 'Error retrieving profile');
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    sendSuccessResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Internal server error');
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, mobileNo, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo, address },
      { new: true } // Make sure to set { new: true } to get the updated user details
    );

    sendSuccessResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to update profile');
  }
};

const setAdmin = async (req, res) => {
  try {
    const userIdToPromote = req.params.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userIdToPromote,
      { isAdmin: true },
      { new: true }
    );

    if (!updatedUser) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'User set as admin successfully', { user: updatedUser });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

const removeAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'Account removed successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to remove account');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  resetPassword,
  updateProfile,
  setAdmin,
  removeAccount,
};
