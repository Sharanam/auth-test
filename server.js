const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
app.use(bodyParser.json());

// Configure MSSQL connection
const config = {
  host: "INVIND759",
  user: "sa",
  password: "Investis@123",
  database: "Sharanam",
  options: {
    encrypt: true, // If using Azure, set to true
  },
};

// Connect to MSSQL
sql
  .connect(config)
  .then(() => {
    console.log("Connected to MSSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to MSSQL:", err);
  });

// Middleware to handle authentication
app.use((req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send("Missing token");
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token expired. Please log in again.");
    } else {
      return res.status(401).send("Invalid token");
    }
  }
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check username and password against the database
  const query =
    "SELECT * FROM users WHERE username = @username AND password = @password";
  const request = new sql.Request();

  request.input("username", sql.VarChar, username);
  request.input("password", sql.VarChar, password);

  request
    .query(query)
    .then((result) => {
      if (result.recordset.length === 0) {
        return res.status(401).send("Invalid username or password");
      }

      // Create a JWT token with the user's ID and username
      const token = jwt.sign(
        { id: result.recordset[0].id, username: result.recordset[0].username },
        "your_secret_key",
        { expiresIn: "1h" }
      );

      return res.json({ token });
    })
    .catch((err) => {
      console.error("Error querying the database:", err);
      return res.status(500).send("Internal Server Error");
    });
});

// Protected route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/secret.html");
});

// Logout route
app.post("/logout", (req, res) => {
  // Implement any necessary logout logic (e.g., invalidating the token in the database)
  return res.status(200).send("Logged out successfully");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
