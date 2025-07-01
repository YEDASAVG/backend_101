/**
 * @file asyncHandler.js
 * @description
 * A higher-order function to wrap asynchronous route handlers and controllers in Express.js.
 *
 * ✅ Purpose:
 *   - Automatically catch rejected promises and thrown errors in async functions.
 *   - Pass those errors to Express's built-in error-handling middleware by calling next(error).
 *
 * 🔧 Why we use it:
 *   - In Node.js/Express, unhandled promise rejections or thrown errors inside async functions
 *     won't be caught unless you wrap them in try/catch.
 *   - Using asyncHandler avoids repetitive try/catch blocks in every route or controller,
 *     keeping code clean and maintainable.
 *
 * 📍 Where to use:
 *   - Wrap every async route handler or controller function.
 *
 * ⚡ Importance:
 *   - Prevents server crashes due to unhandled async errors.
 *   - Keeps all error handling consistent and centralized.
 */

// here we did implicit return
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
};

export { asyncHandler };

// option No. 1
// const asyncHandler = () => {}
// const asyncHandler = (function) => () => {}
// const asyncHandler = (function) => async() => {} we are using this but down below simplified verison

// const asyncHandler = (fn) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };
