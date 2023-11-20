// Import the JSON Web Token (JWT) module
const jwt = require("jsonwebtoken");

// Secret key used for JWT encryption and decryption
const secret = process.env.JWT_SECRET || "EcommerceAPI";

// Function to create an access token when a user logs in
module.exports.createAccessToken = (user) => {
  // Payload containing user information
  const data = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  // Generate a JSON web token using the sign() method
  return jwt.sign(data, secret, {});
};

// Middleware function to verify the JWT in the request headers
module.exports.verify = (req, res, next) => {
  // Retrieve the JWT from the Authorization header
  let token = req.headers.authorization;

  // Check if JWT exists
  if (!token) {
    // If no token is provided, return an unauthorized status
    return res.status(401).json({ auth: false, message: "No token provided" });
  }

  // Extract the token from the "Bearer" prefix
  token = token.slice(7, token.length);

  // Verify the token using the jwt.verify() method
  jwt.verify(token, secret, function (err, decodedToken) {
    if (err) {
      // If the token verification fails, return an unauthorized status
      return res.status(401).json({ auth: false, message: "Failed to authenticate token" });
    }

    // Add the user information to the request object
    req.user = decodedToken;

    // Proceed to the next middleware or controller
    next();
  });
};

// Middleware to verify if the logged-in user is an Admin
module.exports.verifyAdmin = (req, res, next) => {
  // Check if the logged-in user is an admin
  if (req.user.isAdmin) {
    // If the user is an admin, proceed to the next middleware or controller
    next();
  } else {
    // If the user is not an admin, return a forbidden status
    return res.status(403).json({ auth: false, message: "Action Forbidden" });
  }
};
