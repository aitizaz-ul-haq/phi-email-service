const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const app = express();
require('dotenv').config();


// app.use(require('prerender-node').set('prerenderToken', 'MuWSAjv6ZttHqsrBlqP4'));

function isBot(userAgent) {
    const bots = [
    'Googlebot', // Google's crawler
    'Bingbot', // Bing's crawler
    'YandexBot', // Yandex's crawler
    'Applebot', // Apple's Siri and Spotlight Suggestions crawler
    'DuckDuckBot', // DuckDuckGo's crawler
    'Baiduspider', // Baidu's crawler
    'Sogou Spider', // Sogou's crawler
    'facebookexternalhit', // Facebook's crawler for link previews
    'facebot', // Another Facebook crawler variant
    'Twitterbot', // Twitter's crawler for card previews
    'LinkedInBot', // LinkedIn's crawler
    // LinkedInBot variations (be cautious with general HTTP client strings)
    'Mozilla/5.0; Jakarta Commons-HttpClient/3.1', // Specific user agent string, generally for HTTP clients
    'Mozilla/5.0; Jakarta Commons-HttpClient/4.3', // As above
    'Mozilla/5.0; Apache-HttpClient', // As above, commonly used by various clients
    'Exabot', // Exalead's crawler
    'Slurp', // Yahoo's crawler
    'CCBot', // Common Crawl's web crawler
    'GoogleOther', // Google's internal use crawler
    'Google-InspectionTool', // Google Search Console's crawler
    'Swiftbot', // Swiftype’s web crawler, not specifically mentioned in the second list but included for completeness
    'AhrefsBot', // Ahrefs' crawler, important for SEO and link indexing
    'SemrushBot', // SEMrush's crawler, used for SEO and site analysis
    'Rogerbot', // Moz's crawler, gathers data for Moz's SEO tools and services
    'Screaming Frog', // SEO tool crawler, used by the Screaming Frog SEO Spider tool
    'Deepcrawl', // Web crawler for site analysis, helps in auditing and optimizing website structure
    ];
    return bots.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

// Function to generate the SSR page with meta tags
function generateMetaPage(blogData) {
    return `
          <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${blogData.title ? `${blogData.title} | Your Blog Name` : 'Your Blog Name'}</title>
            <meta name="description" content="${blogData.summary || 'Default summary about your blog'}">
      
            <link rel="canonical" href="https://phiconsulting.org/blog/${blogData.urlName}">

            <meta property="og:type" content="article">
            <meta property="og:title" content="${blogData.title || 'Your Blog Title'}">
            <meta property="og:description" content="${blogData.summary || 'A brief summary of your blog'}">
            <meta property="og:image" content="${blogData.imageUrl || 'default_image_url'}">
            <meta property="og:url" content="https://phiconsulting.org/blog/${blogData.urlName}">
            <meta property="og:site_name" content="Your Blog or Company Name">

            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${blogData.title || 'Your Blog Title'}">
            <meta name="twitter:description" content="${blogData.summary || 'A brief summary of your blog'}">
            <meta name="twitter:image" content="${blogData.imageUrl || 'default_image_url'}">

            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:image:alt" content="A descriptive alternate text for your image">
            <meta name="twitter:site" content="@YourTwitterHandle">
            <meta name="twitter:creator" content="@AuthorTwitterHandle">
        </head>
        <body>
            <p>Loading...</p>
            <!-- Minimal body content since this page is for bots only -->
        </body>
        </html>
    `;
}


// MongoDB setup
const url = 'mongodb+srv://dev_phi:paFB82kF3XD45v70@cluster0.5b3psjj.mongodb.net/?retryWrites=true&w=majority'; // Replace with your connection string
const client = new MongoClient(url);
const dbName = 'phiconsulting'; 
// const apiUrl = process.env.API_URL || 'http://localhost:3000';
// const apiUrl = process.env.API_URL || 'http://phi-email-service.vercel.app';

// Middleware
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename
    }
});
const upload = multer({ storage: storage });

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
            pass: 'jehg fgfw fzhl thkv'  // replace with your Gmail password or an app-specific password
        }
    });

    // Configure the email
    const mailOptions = {
        from: 'atz.softprgmr@gmail.com',  // replace with your Gmail address
        to: 'marketing@phi.consulting ', // replace with the recipient's email address
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




// Email Service
// working but file corrupted Email Service
// app.post('/submit-application', upload.single('resume'), async (req, res) => {
//     try {
//         const { fullName, email, contactNo, address, coverLetter } = req.body;
//         const resume = req.file;

//         // Ensure all required form fields are present
//         if (!fullName || !email || !contactNo || !address || !coverLetter || !resume) {
//             return res.status(400).send('Incomplete form data');
//         }

//         // Create a Nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'atz.softprgmr@gmail.com',
//                 pass: 'jehg fgfw fzhl thkv'
//             }
//         });

//         // Configure the email
//         const mailOptions = {
//             from: 'your-gmail-address@gmail.com',
//             to: 'aitaizaz.haq@phi-verse.com',
//             subject: 'Job Application Submission',
//             html: `
//                 <p>Full Name: ${fullName}</p>
//                 <p>Email: ${email}</p>
//                 <p>Contact No: ${contactNo}</p>
//                 <p>Address: ${address}</p>
//                 <p>Cover Letter: ${coverLetter}</p>
//             `,
//             attachments: [
//                 {
//                     filename: resume.originalname,
//                     content: resume.buffer // Use the buffer data from multer
//                 }
//             ]
//         };

//         // Send the email
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//                 return res.status(500).send('Error submitting application');
//             }
//             // Delete the file from the uploads folder after sending the email
//             fs.unlink(resume.path, (err) => {
//                 if (err) {
//                     console.error('Error deleting file:', err);
//                 } else {
//                     console.log('File deleted successfully');
//                 }
//             });
//             res.status(200).send('Application submitted successfully!');
//         });
//     } catch (error) {
//         console.error('Error submitting application:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });



// Email Service
app.post('/submit-application', upload.single('resume'), async (req, res) => {
    try {
        const { fullName, email, contactNo, address, coverLetter } = req.body;
        const resume = req.file;

        // Ensure all required form fields are present
        if (!fullName || !email || !contactNo || !address || !coverLetter || !resume) {
            return res.status(400).send('Incomplete form data');
        }

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'atz.softprgmr@gmail.com',
                pass: 'jehg fgfw fzhl thkv'
            }
        });

        // Read the file from disk
        const fileData = fs.readFileSync(resume.path);

        // Configure the email
        const mailOptions = {
            from: 'your-gmail-address@gmail.com',
            to: 'hr@phi.consulting',
            subject: 'Job Application Submission',
            html: `
                <p>Full Name: ${fullName}</p>
                <p>Email: ${email}</p>
                <p>Contact No: ${contactNo}</p>
                <p>Address: ${address}</p>
                <p>Cover Letter: ${coverLetter}</p>
            `,
            attachments: [
                {
                    filename: resume.originalname,
                    content: fileData // Attach file data read from disk
                }
            ]
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('Error submitting application');
            }
            // Delete the file from the uploads folder after sending the email
            fs.unlink(resume.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully');
                }
            });
            res.status(200).send('Application submitted successfully!');
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = client.db(dbName);
   
    const user = await db.collection('users').findOne({ username });

    if (!user || user.password !== password) {
        return res.status(401).send('Invalid credentials');
    }

    // Here you should create a token and send it back
    res.status(200).send({ token: 'your-generated-token' });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

// const newUser = { username: "admin", password: "admin" }; // Use hashed passwords in production
// db.collection('users').insertOne(newUser);


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

app.get('/blog/:urlName', async (req, res) => {
    const userAgent = req.headers['user-agent'];

    if (isBot(userAgent)) {
        // Detected a bot, serve the SSR page with meta tags
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('blogs');
            const blog = await collection.findOne({ urlName: req.params.urlName });

            if (!blog) {
                return res.status(404).send('Blog not found');
            }

            const metaPage = generateMetaPage(blog);
            res.send(metaPage);
        } catch (error) {
            console.error('Error generating SSR page for bot:', error);
            res.status(500).send('Error serving content');
        } finally {
            await client.close();
        }
    } else {
        // Redirect user to the React app
        const reactAppUrl = `https://phiconsulting.org/blog/${req.params.urlName}`;
        res.redirect(reactAppUrl);
    }
});






app.get('/blogs/name/:urlName', async (req, res) => {
    try {
        await client.connect(); // Ensure MongoDB connection is established
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const { urlName } = req.params;
        
        // Directly query the document by urlName
        const blog = await collection.findOne({ urlName: urlName });
        
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error('Error fetching blog by urlName:', error);
        res.status(500).send('Error fetching blog');
    } finally {
        await client.close(); // Optionally close the connection, depending on your app's design
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

// Fintech CRUD Operations

// GET all fintech entries
app.get('/fintech', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintech');
        const fintechEntries = await collection.find({}).toArray();
        res.status(200).json(fintechEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new fintech entry
app.post('/fintech', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintech');
        const fintechEntry = req.body;
        await collection.insertOne(fintechEntry);
        res.status(201).send('Fintech entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single fintech entry by ID
app.get('/fintech/:fintechId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintech');
        const { fintechId } = req.params;
        const fintechEntry = await collection.findOne({ _id: new ObjectId(fintechId) });

        if (!fintechEntry) {
            return res.status(404).send('Fintech entry not found');
        }

        res.status(200).json(fintechEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a fintech entry by ID
app.put('/fintech/:finId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('fintech');
        const { finId } = req.params;
        const fintechEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(finId) }, { $set: fintechEntry });
        res.status(200).send('Fintech entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a fintech entry by ID
app.delete('/fintech/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('fintech');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Fintech entry deleted successfully');
    } finally {
        await client.close();
    }
});

// GET all fintechinfo entries
app.get('/fintechinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintechinfo');
        const fintechinfoEntries = await collection.find({}).toArray();
        res.status(200).json(fintechinfoEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new fintechinfo entry
app.post('/fintechinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintechinfo');
        const fintechinfoEntry = req.body;
        await collection.insertOne(fintechinfoEntry);
        res.status(201).send('Fintechinfo entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single fintechinfo entry by ID
app.get('/fintechinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintechinfo');
        const { id } = req.params;
        const fintechinfoEntry = await collection.findOne({ _id: new ObjectId(id) });

        if (!fintechinfoEntry) {
            return res.status(404).send('Fintechinfo entry not found');
        }

        res.status(200).json(fintechinfoEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a fintechinfo entry by ID
app.put('/fintechinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintechinfo');
        const { id } = req.params;
        const fintechinfoEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: fintechinfoEntry });
        res.status(200).send('Fintechinfo entry updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// DELETE a fintechinfo entry by ID
app.delete('/fintechinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintechinfo');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Fintechinfo entry deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// IOT CRUD Operations

// GET all iot entries
app.get('/iot', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iot');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/iot', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iot');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('IOT entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/iot/:iotId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iot');
        const { iotId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(iotId) });

        if (!iotEntry) {
            return res.status(404).send('IOT entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/iot/:iotId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iot');
        const { iotId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(iotId) }, { $set: iotEntry });
        res.status(200).send('IOT entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/iot/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iot');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('IOT entry deleted successfully');
    } finally {
        await client.close();
    }
});

// GET all saas entries
app.get('/saas', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saas');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/saas', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saas');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('saas entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/saas/:saasId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saas');
        const { saasId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(saasId) });

        if (!iotEntry) {
            return res.status(404).send('saas entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/saas/:saasId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saas');
        const { saasId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(saasId) }, { $set: iotEntry });
        res.status(200).send('saas entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/saas/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saas');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('saas entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all saas entries
app.get('/devops', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devops');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/devops', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devops');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('devops entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/devops/:devopsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devops');
        const { devopsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(devopsId) });

        if (!iotEntry) {
            return res.status(404).send('devops entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/devops/:devopsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devops');
        const { devopsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(devopsId) }, { $set: iotEntry });
        res.status(200).send('devops entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/devops/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devops');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('devops entry deleted successfully');
    } finally {
        await client.close();
    }
});

// GET all saas entries
app.get('/cloud', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloud');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/cloud', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloud');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('cloud entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/cloud/:cloudId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloud');
        const { cloudId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(cloudId) });

        if (!iotEntry) {
            return res.status(404).send('cloud entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/cloud/:cloudId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloud');
        const { cloudId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(cloudId) }, { $set: iotEntry });
        res.status(200).send('cloud entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/cloud/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloud');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('cloud entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iaas entries
app.get('/iaas', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaas');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/iaas', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaas');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('iaas entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/iaas/:iaasId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaas');
        const { iaasId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(iaasId) });

        if (!iotEntry) {
            return res.status(404).send('iaas entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/iaas/:iaasId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaas');
        const { iaasId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(iaasId) }, { $set: iotEntry });
        res.status(200).send('iaas entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/iaas/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaas');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iaas entry deleted successfully');
    } finally {
        await client.close();
    }
});




// GET all iaas entries
app.get('/gtmpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('gtmpage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/gtmpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('gtmpage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('gtmpage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/gtmpage/:gtmpageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('gtmpage');
        const { gtmpageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(gtmpageId) });

        if (!iotEntry) {
            return res.status(404).send('gtmpage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/gtmpage/:gtmpageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('gtmpage');
        const { gtmpageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(gtmpageId) }, { $set: iotEntry });
        res.status(200).send('gtmpage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/gtmpage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('gtmpage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('gtmpage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iaas entries
app.get('/hrpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('hr');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/hrpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('hr');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('hrpage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/hrpage/:hrpageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('hr');
        const { hrpageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(hrpageId) });

        if (!iotEntry) {
            return res.status(404).send('hrpage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/hrpage/:hrpageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('hr');
        const { hrpageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(hrpageId) }, { $set: iotEntry });
        res.status(200).send('hrpage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/hrpage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('hr');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('hrpage entry deleted successfully');
    } finally {
        await client.close();
    }
});



// GET all iaas entries
app.get('/invpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('invpage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/invpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('invpage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('invpage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/invpage/:invId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('invpage');
        const { invId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(invId) });

        if (!iotEntry) {
            return res.status(404).send('invpage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/invpage/:invId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('invpage');
        const { invId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(invId) }, { $set: iotEntry });
        res.status(200).send('invpage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/invpage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('invpage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('invpage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iaas entries
app.get('/finpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('finpage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/finpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('finpage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('finpage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/finpage/:finId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('finpage');
        const { finId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(finId) });

        if (!iotEntry) {
            return res.status(404).send('finpage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/finpage/:finId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('finpage');
        const { finId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(finId) }, { $set: iotEntry });
        res.status(200).send('finpage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/finpage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('finpage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('finpage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/cloudinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudinfo');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/cloudinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudinfo');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('iotinfo entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/cloudinfo/:cloudinfoId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudinfo');
        const { cloudinfoId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(cloudinfoId) });

        if (!iotEntry) {
            return res.status(404).send('cloudinfo entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/cloudinfo/:cloudinfoId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloudinfo');
        const { cloudinfo } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(cloudinfo) }, { $set: iotEntry });
        res.status(200).send('cloudinfo entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/cloudinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloudinfo');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('cloudinfo entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/iaasinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaasinfo');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/iaasinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaasinfo');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('iaasinfo entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/iaasinfo/:iaasinfoId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaasinfo');
        const { iaasinfoId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(iaasinfoId) });

        if (!iotEntry) {
            return res.status(404).send('iaasinfo entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/iaasinfo/:iaasinfoId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaasinfo');
        const { iaasinfoId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(iaasinfoId) }, { $set: iotEntry });
        res.status(200).send('iaasinfo entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/iaasinfoId/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaasinfo');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iaasinfo entry deleted successfully');
    } finally {
        await client.close();
    }
});



// GET all iot entries
app.get('/iotinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotinfo');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/iotinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotinfo');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('iotinfo entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/iotinfo/:iotInfoId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotinfo');
        const { iotInfoId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(iotInfoId) });

        if (!iotEntry) {
            return res.status(404).send('IOT entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/iotinfo/:iotInfoId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iotinfo');
        const { iotInfoId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(iotInfoId) }, { $set: iotEntry });
        res.status(200).send('iotinfo entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/iotinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iotinfo');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iotinfo entry deleted successfully');
    } finally {
        await client.close();
    }
});

// GET all iotinfo entries
// IOT CRUD Operations

// GET all iot entries
app.get('/devinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devinfo');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/devinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devinfo');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('devinfo entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/devinfo/:devinfoId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devinfo');
        const { devinfoId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(devinfoId) });

        if (!iotEntry) {
            return res.status(404).send('IOT entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/devinfo/:devinfoId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devinfo');
        const { devinfoId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(devinfoId) }, { $set: iotEntry });
        res.status(200).send('devinfo entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/devinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devinfo');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('devinfo entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all saasinfo entries
// saasinfo CRUD Operations

// GET all saasinfo entries
app.get('/saasinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saasinfo');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/saasinfo', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saasinfo');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('saasinfo entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/saasinfo/:saasinfoId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saasinfo');
        const { saasinfoId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(saasinfoId) });

        if (!iotEntry) {
            return res.status(404).send('saasinfo entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/saasinfo/:saasinfoId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saasinfo');
        const { saasinfoId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(saasinfoId) }, { $set: iotEntry });
        res.status(200).send('saasinfo entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/saasinfo/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saasinfo');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('saasinfo entry deleted successfully');
    } finally {
        await client.close();
    }
});


// IOTINFO CRUD Operations

// GET all iotinfo entries
// ... Similar to the above endpoints, but for the 'iotinfo' collection ...


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

// Get a specific article by company name
app.get('/cases/name/:companyName', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cases');
        const { companyName } = req.params;
        const cas = await collection.findOne({ imageone: companyName });

        if (!cas) {
            return res.status(404).send('Case not found');
        }

        res.status(200).json(cas);
    } catch (error) {
      console.error('Error fetching case study by company name:', error);
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

app.post('/jobs', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('jobs');
        const job = req.body;
        await collection.insertOne(job);
        res.status(201).send('Job created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/jobs', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('jobs');
        const jobs = await collection.find({}).toArray();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/jobs/:jobId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('jobs');
        const { jobId } = req.params;
        const job = await collection.findOne({ _id: new ObjectId(jobId) });

        if (!job) {
            return res.status(404).send('Job not found');
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


app.put('/jobs/:jobId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('jobs');
        const { jobId } = req.params;
        const job = req.body;
        await collection.updateOne({ _id: new ObjectId(jobId) }, { $set: job });
        res.status(200).send('Job updated successfully');
    } finally {
        await client.close();
    }
});


app.delete('/jobs/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('jobs');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Job deleted successfully');
    } finally {
        await client.close();
    }
});


///////////////////////////////////////////////////////////////
// Banner APIs
///////////////////////////////////////////////////////////////


app.post('/saasban', async (req, res) => {
    try {
         await connectToMongo();
         const db = client.db(dbName);
        const collection = db.collection('saasban');
        const saasban = req.body;
        await collection.insertOne(saasban);
        res.status(201).send('SaaSban created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get all SaaSban entries
app.get('/saasban', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saasban');
        const saasbanEntries = await collection.find({}).toArray();
        res.status(200).json(saasbanEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get a specific SaaSban entry
app.get('/saasban/:saasbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saasban');
        const { saasbanId } = req.params;
        const saasban = await collection.findOne({ _id: new ObjectId(saasbanId) });

        if (!saasban) {
            return res.status(404).send('SaaSban not found');
        }

        res.status(200).json(saasban);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Update a SaaSban entry
app.put('/saasban/:saasbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saasban');
        const { saasbanId } = req.params;
        const saasban = req.body;
        await collection.updateOne({ _id: new ObjectId(saasbanId) }, { $set: saasban });
        res.status(200).send('SaaSban updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// Delete a SaaSban entry
app.delete('/saasban/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saasban');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('SaaSban deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});


app.post('/iaasban', async (req, res) => {
    try {
         await connectToMongo();
         const db = client.db(dbName);
        const collection = db.collection('iaasban');
        const iaasban = req.body;
        await collection.insertOne(iaasban);
        res.status(201).send('iaasban created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get all SaaSban entries
app.get('/iaasban', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaasban');
        const saasbanEntries = await collection.find({}).toArray();
        res.status(200).json(saasbanEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get a specific SaaSban entry
app.get('/iaasban/:iaasbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaasban');
        const { iaasbanId } = req.params;
        const saasban = await collection.findOne({ _id: new ObjectId(iaasbanId) });

        if (!saasban) {
            return res.status(404).send('iaasban not found');
        }

        res.status(200).json(saasban);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Update a SaaSban entry
app.put('/iaasban/:iaasbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaasban');
        const { iaasbanId } = req.params;
        const saasban = req.body;
        await collection.updateOne({ _id: new ObjectId(iaasbanId) }, { $set: saasban });
        res.status(200).send('iaasban updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// Delete a SaaSban entry
app.delete('/iaasban/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaasban');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iaasban deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});




app.post('/iotban', async (req, res) => {
    try {
         await connectToMongo();
         const db = client.db(dbName);
        const collection = db.collection('iotban');
        const iaasban = req.body;
        await collection.insertOne(iaasban);
        res.status(201).send('iotban created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get all SaaSban entries
app.get('/iotban', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotban');
        const saasbanEntries = await collection.find({}).toArray();
        res.status(200).json(saasbanEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get a specific SaaSban entry
app.get('/iotban/:iotbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotban');
        const { iotbanId } = req.params;
        const saasban = await collection.findOne({ _id: new ObjectId(iotbanId) });

        if (!saasban) {
            return res.status(404).send('iotban not found');
        }

        res.status(200).json(saasban);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Update a SaaSban entry
app.put('/iotban/:iotbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotban');
        const { iotbanId } = req.params;
        const saasban = req.body;
        await collection.updateOne({ _id: new ObjectId(iotbanId) }, { $set: saasban });
        res.status(200).send('iotban updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// Delete a SaaSban entry
app.delete('/iotban/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iotban');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iotban deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});





app.post('/fintban', async (req, res) => {
    try {
         await connectToMongo();
         const db = client.db(dbName);
        const collection = db.collection('fintban');
        const iaasban = req.body;
        await collection.insertOne(iaasban);
        res.status(201).send('fintban created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get all SaaSban entries
app.get('/fintban', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintban');
        const saasbanEntries = await collection.find({}).toArray();
        res.status(200).json(saasbanEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get a specific SaaSban entry
app.get('/fintban/:fintbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintban');
        const { fintbanId } = req.params;
        const saasban = await collection.findOne({ _id: new ObjectId(fintbanId) });

        if (!saasban) {
            return res.status(404).send('fintban not found');
        }

        res.status(200).json(saasban);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Update a SaaSban entry
app.put('/fintban/:fintbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fintban');
        const { fintbanId } = req.params;
        const saasban = req.body;
        await collection.updateOne({ _id: new ObjectId(fintbanId) }, { $set: saasban });
        res.status(200).send('fintban updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// Delete a SaaSban entry
app.delete('/fintban/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('fintban');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('fintban deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});


app.post('/devban', async (req, res) => {
    try {
         await connectToMongo();
         const db = client.db(dbName);
        const collection = db.collection('devban');
        const iaasban = req.body;
        await collection.insertOne(iaasban);
        res.status(201).send('devban created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get all SaaSban entries
app.get('/devban', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devban');
        const saasbanEntries = await collection.find({}).toArray();
        res.status(200).json(saasbanEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Get a specific SaaSban entry
app.get('/devban/:devbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devban');
        const { devbanId } = req.params;
        const saasban = await collection.findOne({ _id: new ObjectId(devbanId) });

        if (!saasban) {
            return res.status(404).send('devban not found');
        }

        res.status(200).json(saasban);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Update a SaaSban entry
app.put('/devban/:devbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devban');
        const { devbanId } = req.params;
        const saasban = req.body;
        await collection.updateOne({ _id: new ObjectId(devbanId) }, { $set: saasban });
        res.status(200).send('fintban updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// Delete a SaaSban entry
app.delete('/devban/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devban');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('devban deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});


// Get all SaaSban entries
app.get('/cloudban', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudban');
        const saasbanEntries = await collection.find({}).toArray();
        res.status(200).json(saasbanEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


// Get a specific SaaSban entry
app.get('/cloudban/:cloudbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudban');
        const { cloudbanId } = req.params;
        const saasban = await collection.findOne({ _id: new ObjectId(cloudbanId) });

        if (!saasban) {
            return res.status(404).send('cloudban not found');
        }

        res.status(200).json(saasban);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/cloudban', async (req, res) => {
    try {
         await connectToMongo();
         const db = client.db(dbName);
        const collection = db.collection('cloudban');
        const iaasban = req.body;
        await collection.insertOne(iaasban);
        res.status(201).send('cloudban created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


// Update a SaaSban entry
app.put('/cloudban/:cloudbanId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudban');
        const { cloudbanId } = req.params;
        const saasban = req.body;
        await collection.updateOne({ _id: new ObjectId(cloudbanId) }, { $set: saasban });
        res.status(200).send('cloudban updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// Delete a SaaSban entry
app.delete('/cloudban/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloudban');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('cloudban deleted successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    } finally {
        await client.close();
    }
});

// -----------------------------------cards sections---------------------

// GET all iot entries
app.get('/saascards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saascards');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/saascards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saascards');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('saascards entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/saascards/:saascardsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('saascards');
        const { saascardsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(saascardsId) });

        if (!iotEntry) {
            return res.status(404).send('saascards entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/saascards/:saascardsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saascards');
        const { saascardsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(saascardsId) }, { $set: iotEntry });
        res.status(200).send('saascards entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/saascards/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('saascards');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('saascards entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/iotcards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotcards');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/iotcards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotcards');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('iotcards entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/iotcards/:iotcardsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iotcards');
        const { iotcardsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(iotcardsId) });

        if (!iotEntry) {
            return res.status(404).send('iotcards entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/iotcards/:iotcardsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iotcards');
        const { iotcardsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(iotcardsId) }, { $set: iotEntry });
        res.status(200).send('iotcards entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/iotcards/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iotcards');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iotcards entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/iaascards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaascards');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/iaascards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaascards');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('iaascards entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/iaascards/:iaascardsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('iaascards');
        const { iaascardsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(iaascardsId) });

        if (!iotEntry) {
            return res.status(404).send('iaascards entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/iaascards/:iaascardsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaascards');
        const { iaascardsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(iaascardsId) }, { $set: iotEntry });
        res.status(200).send('iaascards entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/iaascards/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('iaascards');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('iaascards entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/cloudcards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudcards');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/cloudcards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudcards');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('cloudcards entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/cloudcards/:cloudcardsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('cloudcards');
        const { cloudcardsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(cloudcardsId) });

        if (!iotEntry) {
            return res.status(404).send('cloudcards entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/cloudcards/:cloudcardsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloudcards');
        const { cloudcardsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(cloudcardsId) }, { $set: iotEntry });
        res.status(200).send('cloudcards entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/cloudcards/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('cloudcards');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('cloudcards entry deleted successfully');
    } finally {
        await client.close();
    }
});



// GET all iot entries
app.get('/fincards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fincards');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/fincards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fincards');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('fincards entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/fincards/:fincardsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('fincards');
        const { fincardsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(fincardsId) });

        if (!iotEntry) {
            return res.status(404).send('fincards entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/fincards/:fincardsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('fincards');
        const { fincardsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(fincardsId) }, { $set: iotEntry });
        res.status(200).send('fincards entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/fincards/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('fincards');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('fincards entry deleted successfully');
    } finally {
        await client.close();
    }
});

// GET all iot entries
app.get('/devcards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devcards');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/devcards', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devcards');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('devcards entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/devcards/:devcardsId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('devcards');
        const { devcardsId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(devcardsId) });

        if (!iotEntry) {
            return res.status(404).send('devcards entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/devcards/:devcardsId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devcards');
        const { devcardsId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(devcardsId) }, { $set: iotEntry });
        res.status(200).send('devcards entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/devcards/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('devcards');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('devcards entry deleted successfully');
    } finally {
        await client.close();
    }
});

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////// Others page API //////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

// GET all iot entries
app.get('/aboutuspage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('aboutuspage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/aboutuspage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('aboutuspage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('aboutuspage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/aboutuspage/:aboutuspageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('aboutuspage');
        const { aboutuspageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(aboutuspageId) });

        if (!iotEntry) {
            return res.status(404).send('aboutuspage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/aboutuspage/:aboutuspageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('aboutuspage');
        const { aboutuspageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(aboutuspageId) }, { $set: iotEntry });
        res.status(200).send('aboutuspage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/aboutuspage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('aboutuspage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('aboutuspage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/homepage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('homepage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/homepage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('homepage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('homepage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/homepage/:homepageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('homepage');
        const { homepageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(homepageId) });

        if (!iotEntry) {
            return res.status(404).send('homepage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/homepage/:homepageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('homepage');
        const { homepageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(homepageId) }, { $set: iotEntry });
        res.status(200).send('homepage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/homepage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('homepage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('homepage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/careerspage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('careerspage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/careerspage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('careerspage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('careerspage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/careerspage/:careerspageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('careerspage');
        const { careerspageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(careerspageId) });

        if (!iotEntry) {
            return res.status(404).send('careerspage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/careerspage/:careerspageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('careerspage');
        const { careerspageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(careerspageId) }, { $set: iotEntry });
        res.status(200).send('careerspage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/careerspage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('careerspage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('careerspage entry deleted successfully');
    } finally {
        await client.close();
    }
});



// GET all iot entries
app.get('/valuecreationpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/valuecreationpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('valuecreationpage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/valuecreationpage/:valuecreationpageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const { valuecreationpageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(valuecreationpageId) });

        if (!iotEntry) {
            return res.status(404).send('valuecreationpage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/valuecreationpage/:valuecreationpageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const { valuecreationpageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(valuecreationpageId) }, { $set: iotEntry });
        res.status(200).send('valuecreationpage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/valuecreationpage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('valuecreationpage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/valuecreationpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/valuecreationpage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('valuecreationpage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/valuecreationpage/:valuecreationpageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const { valuecreationpageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(valuecreationpageId) });

        if (!iotEntry) {
            return res.status(404).send('valuecreationpage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/valuecreationpage/:valuecreationpageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const { valuecreationpageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(valuecreationpageId) }, { $set: iotEntry });
        res.status(200).send('valuecreationpage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/valuecreationpage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('valuecreationpage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('valuecreationpage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// GET all iot entries
app.get('/servicepage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('servicepage');
        const iotEntries = await collection.find({}).toArray();
        res.status(200).json(iotEntries);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// POST a new iot entry
app.post('/servicepage', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('servicepage');
        const iotEntry = req.body;
        await collection.insertOne(iotEntry);
        res.status(201).send('servicespage entry created successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// GET a single iot entry by ID
app.get('/servicepage/:servicespageId', async (req, res) => {
    try {
        await connectToMongo();
        const db = client.db(dbName);
        const collection = db.collection('servicepage');
        const { servicespageId } = req.params;
        const iotEntry = await collection.findOne({ _id: new ObjectId(servicespageId) });

        if (!iotEntry) {
            return res.status(404).send('servicespage entry not found');
        }

        res.status(200).json(iotEntry);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// PUT (update) a iot entry by ID
app.put('/servicepage/:servicespageId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('servicepage');
        const { servicespageId } = req.params;
        const iotEntry = req.body;
        await collection.updateOne({ _id: new ObjectId(servicespageId) }, { $set: iotEntry });
        res.status(200).send('servicespage entry updated successfully');
    } finally {
        await client.close();
    }
});

// DELETE a iot entry by ID
app.delete('/servicepage/:id', async (req, res) => {
    try {
        await connectToMongo();
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('servicepage');
        const { id } = req.params;
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('servicespage entry deleted successfully');
    } finally {
        await client.close();
    }
});


// Server setup
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
