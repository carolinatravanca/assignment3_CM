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
    app.post('/api/createUser', createUser)
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
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
            },
        });
    } else {
        response.json({ success: false, message: 'Invalid credentials' });
    }
}

async function createUser(message, response) {
    const { username, password } = message.body;
    if (!username || !password) {
        response.status(400).json({ success: false, message: "Username and password are required." });
        return;
    }

    const owners =await client.db('finalProject').collection('owner');

    const existingUser = await owners.findOne({ username: username });
    if (existingUser) {
        response.status(409).json({ success: false, message: "Username already exists. Please choose another." });
        return;
    }

    const result = await owners.insertOne({
        username,
        password,
        createdAt: new Date(),
    });

    if (result.acknowledged) {
        response.status(201).json({ success: true, message: "Account created successfully!" });
    } else {
        response.status(500).json({ success: false, message: "Failed to create account. Please try again later." });
    }
};

async function getAllNotes(message, response) {
    const ownerId = message.query.owner;
    const searchTerm = message.query.search || "";

    if (!ownerId) {
        response.status(400).json({ error: "Owner ID is required." });
        return;
    }

    const notesCollection = client.db("finalProject").collection("notes");

    const query = {
        owner: new mongodb.ObjectId(ownerId),
    };

    if (searchTerm) {
        query.$or = [
            { title: { $regex: searchTerm, $options: "i" } },
            { text: { $regex: searchTerm, $options: "i" } }, 
        ];
    }

    const notes = await notesCollection.find(query).toArray();

    const formattedNotes = notes.map((note) => ({
        id: note._id.toString(),
        title: note.title || "Untitled",
        text: note.text,
        category: note.category || null,
    }));

    response.status(200).json(formattedNotes);
}

async function saveNoteToDB(owner, text, title, category = null) {
    const notesCollection = client.db('finalProject').collection('notes');

    
    return await notesCollection.insertOne({
        owner: new mongodb.ObjectId(owner),
        text,
        title: title || "Untitled",
        category,
        createdAt: new Date(),
    });
}

async function addNote(message, response) {
    const { owner, text, title, category } = message.body;

    if (!owner || !text || !title) {
        response.status(400).json({ error: 'Missing required fields: owner, title, or text' });
        return;
    }

    const result = await saveNoteToDB(owner, text, title, category);

    if (result.acknowledged) {
        response.status(201).json({ success: true, id: result.insertedId });
    } else {
        response.status(500).json({ error: 'Failed to save note' });
    }
}


async function updateNote(message, response) {
    const id = message.params.id; 
    const update = message.body;
    if (!id || !update) {
        response.status(400).json({ error: "Invalid ID or update data" });
        return;
    }

    const notes = client.db("finalProject").collection("notes");
    const result = await notes.updateOne(
        { _id: new mongodb.ObjectId(id) },
        { $set: update }
    );

    if (result.matchedCount > 0) {
        response.json({ success: true, message: "Note updated successfully" });
    } else {
        response.status(404).json({ success: false, message: "Note not found" });
    }
}




async function deleteNote(message, response) {
    const id = message.params.id;
    const notesCollection = client.db('finalProject').collection('notes'); 

    const result = await notesCollection.deleteOne({ _id: new mongodb.ObjectId(id) }); 

    if (result.deletedCount === 1) {
        response.status(200).json({ success: true, message: 'Note deleted successfully' });
    } else {
        response.status(404).json({ success: false, message: 'Note not found' });
    }
}


main();
