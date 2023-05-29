const express = require("express");
const app = express();

app.use((req, res, next) => {
  const auth = req.headers["authorization"];

  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="My Realm"');
    return res
      .status(401)
      .send("Text to send if the user hits the Cancel button");
  }

  const credentials = Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");
  const username = credentials[0];
  const password = credentials[1];

  if (checkCredentials(username, password)) {
    req.user = { username };
    next();
  } else {
    res.set("WWW-Authenticate", 'Basic realm="My Realm"');
    return res.status(401).send("Invalid username or password");
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/asset/secret.html");
});

app.get("/logout", (req, res) => {
  const sessionId = req.headers["x-session-id"];

  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
    return res.redirect("/");
  }
  res.set("WWW-Authenticate", 'Basic realm="My Realm"');
  return res.status(401).send("Invalid session");
});

// Check the credentials against your authentication logic
function checkCredentials(username, password) {
  const validUsername = "admin";
  const validPassword = "password";

  // Store session
  const sessionId = generateSessionId();
  sessions[sessionId] = {
    username,
    authenticated: true,
  };

  return username === validUsername && password === validPassword;
}

// Generate a random session ID
function generateSessionId() {
  return Math.random().toString(36).slice(2);
}

const sessions = {};

// static files
app.use(express.static("./asset"));

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
