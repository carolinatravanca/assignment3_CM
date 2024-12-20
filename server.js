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
    const owners = client.db('finalProject').collection('owner');

    const user = await owners.findOne({ username: username, password: password });

    if (user) {
        response.json({
            success: true,
            user: {
                id: user._id.toString(), // Return the owner's ID
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
    const ownerId = message.query.owner;

    if (!ownerId) {
        response.status(400).json({ error: 'Owner ID is required.' });
        return;
    }

    const notesCollection = client.db('finalProject').collection('notes');
    const notes = await notesCollection.find({ owner: new mongodb.ObjectId(ownerId) }).toArray();

    const formattedNotes = notes.map(note => ({
        id: note._id.toString(),
        title: note.title || 'Untitled',
        text: note.text,
        category: note.category || null,
    }));

    response.status(200).json(formattedNotes);
}






async function saveNoteToDB(owner, text, title, category = null) {
    const notesCollection = client.db('finalProject').collection('notes');

    // Insert the note into the database
    return await notesCollection.insertOne({
        owner: new mongodb.ObjectId(owner), // Convert owner to ObjectId
        text,
        title: title || "Untitled",
        category,
        createdAt: new Date(), // Timestamp
    });
}

async function addNote(message, response) {
    const { owner, text, title, category } = message.body;

    // Validate the required fields
    if (!owner || !text || !title) {
        response.status(400).json({ error: 'Missing required fields: owner, title, or text' });
        return;
    }

    // Call the reusable function to save the note
    const result = await saveNoteToDB(owner, text, title, category);

    if (result.acknowledged) {
        response.status(201).json({ success: true, id: result.insertedId });
    } else {
        response.status(500).json({ error: 'Failed to save note' });
    }
}



async function updateNote(message, response) {
    const id = message.params.id;
    const { title, text, category } = message.body;

    if (!title && !text && !category) {
        response.status(400).json({ error: "Nothing to update." });
        return;
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (text) updateFields.text = text;
    if (category) updateFields.category = category;

    const result = await client.db('finalProject').collection('notes').updateOne(
        { _id: new mongodb.ObjectId.createFromHexString(id) },
        { $set: updateFields }
    );

    if (result.matchedCount > 0) {
        response.status(200).json({ success: true });
    } else {
        response.status(404).json({ error: "Note not found." });
    }
}


async function deleteNote(message, response) {
    const id = message.params.id; // Extract the ID from the request parameters
    const notesCollection = client.db('finalProject').collection('notes'); // Access the notes collection

    const result = await notesCollection.deleteOne({ _id: new mongodb.ObjectId(id) }); // Delete the note by ID

    if (result.deletedCount === 1) {
        response.status(200).json({ success: true, message: 'Note deleted successfully' });
    } else {
        response.status(404).json({ success: false, message: 'Note not found' });
    }
}


main();
