/**
 * @file ApiError.js
 * @description
 * Custom error class that extends the built-in JavaScript Error.
 * Designed to create consistent and structured API error responses in Node.js / Express apps.
 *
 * ✅ Purpose:
 *   - Attach extra details to errors (like HTTP status code, success flag, and more).
 *   - Keep all API error responses in the same format.
 *
 * 📍 Where to use:
 *   - Inside controllers, services, or middleware when you want to signal an error.
 *     For example, when something is not found or validation fails.
 *
 * 🔧 Why we use it:
 *   - Instead of throwing generic Error (which only has a message),
 *     this lets you add statusCode, success flag, and detailed info.
 *   - Makes error handling and frontend integration cleaner.
 *
 * ⚡ Importance:
 *   - Ensures the frontend always gets predictable JSON responses for errors.
 *   - Helps debugging by keeping a clear stack trace of where the error was created.
 *   - Supports adding extra context (like validation errors) easily.
 */

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
