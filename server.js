const express = require("express");
const path = require("path");
const fs = require("fs");
const mongodb = require('mongodb')

const app = express();
const client = new mongodb.MongoClient('mongodb://localhost:3000')

// Middleware for MIME type validation
app.use("/static", (req, res, next) => {
    const filePath = path.resolve(__dirname, "static", req.url);
    next();
});


// Serve static files after MIME validation
app.use("/static", express.static(path.resolve(__dirname, "static")));

async function main() {
    await client.connect()
    const db = client.db('finalProject')

    app.get("/api/notes", async (message, response) => {
        const notes = await db.collection('notes').find({}).toArray()
        response.json(notes)
    })

    app.post("/api/notes", async (message, response) => {
        const newNote = message.body
        const result = await db.collection('notes').insertOne(newNote)
        response.json(result)
    })

    app.put("/api/notes/:id", async (message, response) => {
        const { id } = message.params
        const update = message.body
        const result = await db.collection('notes').updateOne(
            { _id: new mongodb.ObjectId(id) },
            { $set: update }
        )
        response.json(result)
    })
    app.delete("/api/notes/:id", async (message, response) => {
        const { id } = message.params
        const result = await db.collection('notes').deleteOne(
            { _id: new mongodb.ObjectId(id) }
        )
        response.json(result)
    })

    // Serve index.html for all other routes
    app.get("/*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "index.html"));
    });

    // Start the server
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}


