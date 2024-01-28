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
    // Extract form data from the request body
    const { name, email, contactNo, companyName, message } = req.body;

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'atz.softprgmr@gmail.com', // replace with your Gmail address
            pass: 'Sadibhi3330027'  // replace with your Gmail password or an app-specific password
        }
    });

    // Configure the email
    const mailOptions = {
        from: 'atz.softprgmr@gmail.com',  // replace with your Gmail address
        to: 'aitaizaz.haq@phi-verse.com', // replace with the recipient's email address
        subject: 'Contact Form Submission',
        html: `
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Contact No: ${contactNo}</p>
            <p>Company Name: ${companyName}</p>
            <p>Message: ${message}</p>
        `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Email sent successfully!');
    });
});

// Blog CRUD Operations
app.get('/blogs', async (req, res) => {
    try {
        await connectToMongo();
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

app.get('/blogs/:blogId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const { blogId } = req.params;
        const blog = await collection.findOne({ _id: new ObjectId(blogId) });

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


app.put('/blogs/:blogId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const { blogId } = req.params; // Make sure this matches the parameter name in the route
        const blog = req.body;
        await collection.updateOne({ _id: new ObjectId(blogId) }, { $set: blog });
        res.status(200).send('Blog updated successfully');
    } finally {
        await client.close();
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        await connectToMongo();
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

// Get all articles
app.get('/cases', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cases');
        const articles = await collection.find({}).toArray();
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Create a new article
app.post('/cases', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cases');
        const article = req.body;
        await collection.insertOne(article);
        res.status(201).send('Article created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get a specific article
app.get('/cases/:caseId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cases');
        const { caseId } = req.params;
        const cas = await collection.findOne({ _id: new ObjectId(caseId) });

        if (!cas) {
            return res.status(404).send('case not found');
        }

        res.status(200).json(cas);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Update an article
app.put('/cases/:caseId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cases');
        const { caseId } = req.params;
        const cas = req.body;
        await collection.updateOne({ _id: new ObjectId(caseId) }, { $set: cas });
        res.status(200).send('case updated successfully');
    } finally {
        await client.close();
    }
});

// Delete an article
app.delete('/cases/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cases');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Article deleted successfully');
    } finally {
        await client.close();
    }
});

// Server setup
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
