const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware for MIME type validation
app.use("/static", (req, res, next) => {
    const filePath = path.resolve(__dirname, "static", req.url);
    next();
});


// Serve static files after MIME validation
app.use("/static", express.static(path.resolve(__dirname, "static")));

// Serve index.html for all other routes
app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
