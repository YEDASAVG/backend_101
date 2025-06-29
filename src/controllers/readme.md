# controllers

This folder contains controller functions that handle incoming HTTP requests.

**Purpose:**

- Receive and validate input data from the client.
- Call appropriate services, business logic, or directly interact with models.
- Return HTTP responses in JSON (or other formats).

**When to add a file:**

- Create a new controller file when you add a new resource or feature (e.g., `userController.js`, `productController.js`).

**Example:**

- `userController.js` → Handles signup, login, update profile.
- `orderController.js` → Handles creating, updating, deleting orders.
