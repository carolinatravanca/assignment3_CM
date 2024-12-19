const express = require('express');
const mongodb = require('mongodb');
const path = require('path');

const app = express();
const client = new mongodb.MongoClient('mongodb://localhost:27017');

async function main() {
    process.on('SIGINT', async () => {
        await client.close();
        process.exit();
    });

    await client.connect();

    app.use('/static', express.static(path.resolve(__dirname, 'static')));
    app.use(express.json())

    app.post('/api/login', loginUser);
    app.get('/api/notes', getAllNotes);
    app.post('/api/notes', addNote);
    app.put('/api/notes/:id', updateNote);
    app.delete('/api/notes/:id', deleteNote);

    app.get('/*', (message, response) => {
        response.sendFile(path.resolve(__dirname, 'index.html'));
    });

    app.listen(5500, () => console.log('Server running on port'));
}

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

//see this again
async function getAllNotes(message, response) {
    const db = client.db('finalProject');
    const owner = message.query.owner;

    
    const ownerData = await db.collection('owner').findOne({ username: owner });
    if (!ownerData) {
        response.status(404).json({ error: 'Owner not found.' });
        return;
    }

    const notes = await db.collection('notes').find({ owner: ownerData._id }).toArray();

    const formattedNotes = notes.map(note => ({
        id: note._id.toString(),
        title: note.title,
        content: note.text,
        category: note.category ? note.category.toString() : null
    }));

    response.status(200).json(formattedNotes);
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
