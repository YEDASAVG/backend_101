/**
 * @file ApiResponse.js
 * @description
 * Custom response class to create consistent, structured JSON responses in Node.js / Express APIs.
 *
 * ✅ Purpose:
 *   - Wrap successful API responses in a standard format.
 *   - Include status code, data, message, and success flag in every response.
 *
 * 📍 Where to use:
 *   - Inside controllers or services when sending successful responses to the client.
 *     Example: return new ApiResponse(200, userData, "User fetched successfully").
 *
 * 🔧 Why we use it:
 *   - Keeps all successful API responses consistent in structure.
 *   - Makes it easier for the frontend to handle responses predictably.
 *
 * ⚡ Importance:
 *   - Improves maintainability by avoiding ad-hoc JSON responses in different routes.
 *   - Automatically sets the success flag based on HTTP status code (< 400).
 *   - Provides a clear message alongside returned data.
 */

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    gf;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export { ApiResponse };
