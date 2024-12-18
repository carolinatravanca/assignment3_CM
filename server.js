const express = require('express');
const mongodb = require('mongodb');
const path = require('path');

const app = express();
const client = new mongodb.MongoClient('mongodb://localhost:27017');

// Startup
async function main() {
    process.on('SIGINT', async () => {
        await client.close();
        process.exit();
    });

    await client.connect();

    // Serve static files
    app.use('/static', express.static(path.resolve(__dirname, 'static')));
    app.use(express.json()); // JSON middleware

    // Endpoints
    app.post('/api/login', loginUser);
    app.get('/api/notes', getAllNotes);
    app.post('/api/notes', addNote);
    app.put('/api/notes/:id', updateNote);
    app.delete('/api/notes/:id', deleteNote);

    // Serve the frontend (index.html)
    app.get('/*', (message, response) => {
        response.sendFile(path.resolve(__dirname, 'index.html'));
    });

    app.listen(5500, () => console.log('Server running on port'));
}

// Handlers
async function loginUser(message, response) {
    const { username, password } = message.body;
    const owners = client.db('finalProject').collection('owner'); // Changed to 'owner'

    const user = await owners.findOne({ username: username, password: password });

    if (user) {
        response.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
            },
        });
    } else {
        response.json({ success: false, message: 'Invalid credentials' });
    }
}


async function getAllNotes(message, response) {
    const notes = await client.db('finalProject').collection('notes').find({}).toArray();
    response.json(notes);
}

async function addNote(message, response) {
    const newNote = message.body;
    const result = await client.db('finalProject').collection('notes').insertOne(newNote);
    response.json(result);
}

async function updateNote(message, response) {
    const id = message.params.id;
    const update = message.body;

    const result = await client.db('finalProject').collection('notes').updateOne(
        { _id: new mongodb.ObjectId.createFromHexString(id) },
        { $set: update }
    );

    response.json(result);
}

async function deleteNote(message, response) {
    const id = message.params.id;

    const result = await client.db('finalProject').collection('notes').deleteOne({
        _id: new mongodb.ObjectId.createFromHexString(id),
    });

    response.json(result);
}

main();
