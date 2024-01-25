


const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

// MongoDB setup
const url = 'mongodb+srv://dev_phi:paFB82kF3XD45v70@cluster0.5b3psjj.mongodb.net/?retryWrites=true&w=majority'; // Replace with your connection string
const client = new MongoClient(url);
const dbName = 'phiconsulting'; 

// Middleware
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
}
connectToMongo();

// Email Service
app.post('/send-email', (req, res) => {
    // Your existing email service code...
});

// Blog CRUD Operations
app.get('/blogs', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const blogs = await collection.find({}).toArray();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/blogs', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const blog = req.body;
        await collection.insertOne(blog);
        res.status(201).send('Blog created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const { id } = req.params;
        const blog = req.body;
        await collection.updateOne({ _id: ObjectId(id) }, { $set: blog });
        res.status(200).send('Blog updated successfully');
    } finally {
        await client.close();
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Blog deleted successfully');
    } finally {
        await client.close();
    }
});

// Server setup
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
