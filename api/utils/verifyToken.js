import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' from the header
  }

  // If no token in header, check cookies
  if (!token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, "Token has expired"));
    }
    return next(createError(403, "Token is not valid!"));
  }
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user._id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

// export const verifyUser = (req, res, next) => {
//   verifyToken(req, res, next, () => {
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//       next();
//     } else {
//       return next(createError(403, "You are not authorized!"));
//     }
//   });
// };

// export const verifyAdmin = (req, res, next) => {
//   verifyToken(req, res, next, () => {
//     if (req.user.isAdmin) {
//       next();
//     } else {
//       return next(createError(403, "You are not authorized!"));
//     }
//   });
// };