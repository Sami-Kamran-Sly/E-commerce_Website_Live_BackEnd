import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";

export const requireSignIn = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Missing token" });
    }

    // Verify the token with the provided secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};


// The next parameter in your code is a callback function provided by the Express.js framework, used in middleware functions to pass control to the next middleware in the stack. When next() is called, Express knows that the current middleware has finished its task and it can move on to the next middleware or route handler.

// Here's how it works in your case:

// In the requireSignIn middleware:

// export const requireSignIn = async (req, res, next) => {
  //... token verification logic
  // next(); // Passes control to the next middleware function or route handler
// };

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



