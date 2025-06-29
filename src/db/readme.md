# db

This folder manages everything related to the database.

**Purpose:**

- Establish and export the database connection (e.g., MongoDB, PostgreSQL).
- Store migration scripts or seed data if needed.

**When to add a file:**

- When you set up the initial database connection.
- When adding migration scripts, database utilities, or configuration.

**Example:**

- `connect.js` → Connects to MongoDB using Mongoose.
- `seed.js` → Populates the database with initial data.
