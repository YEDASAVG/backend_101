# middlewares

This folder holds Express middleware functions.

**Purpose:**

- Handle cross-cutting concerns like authentication, authorization, logging, error handling, etc.
- Modify request or response objects before they reach the controllers.

**When to add a file:**

- When you need reusable logic to run before or after controllers.

**Example:**

- `authMiddleware.js` → Checks if a user is logged in.
- `errorHandler.js` → Formats and returns API errors.
- `logger.js` → Logs incoming requests.
