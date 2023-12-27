const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();

// Use cors middleware
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

const port = 3000;

// Middleware to parse JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle GET requests at the root path
app.get('/', (req, res) => {
    res.send('Server is running on port 3000');
});

app.get('/test', (req, res) => {
    res.send('Test route works!');
});



// Handle form submissions
// app.post('/send-email', (req, res) => {
//     // Extract form data from the request body
//     const { name, email, contactNo, companyName, message } = req.body;

//     // Create a Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'atz.softprgmr@gmail.com', // replace with your Gmail address
//             pass: 'Sadibhi3330027'  // replace with your Gmail password or an app-specific password
//         }
//     });

//     // Configure the email
//     const mailOptions = {
//         from: 'atz.softprgmr@gmail.com',  // replace with your Gmail address
//         to: 'aitaizaz.haq@phi-verse.com', // replace with the recipient's email address
//         subject: 'Contact Form Submission',
//         html: `
//             <p>Name: ${name}</p>
//             <p>Email: ${email}</p>
//             <p>Contact No: ${contactNo}</p>
//             <p>Company Name: ${companyName}</p>
//             <p>Message: ${message}</p>
//         `
//     };

//     // Send the email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return res.status(500).send(error.toString());
//         }
//         res.status(200).send('Email sent successfully!');
//     });
// });

app.post('/send-email', (req, res) => {
    const { name, email, contactNo, companyName, message } = req.body;

    console.log('Received form data:', req.body);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'atz.softprgmr@gmail.com',
            pass: 'xivb rowo ylng gquj'
        }
    });

    const mailOptions = {
        from: 'atz.softprgmr@gmail.com ',
        to: 'aitaizaz.haq@phi-verse.com',
        subject: 'Contact Form Submission',
        html: `
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Contact No: ${contactNo}</p>
            <p>Company Name: ${companyName}</p>
            <p>Message: ${message}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send(error.toString());
        }
        console.log('Email sent successfully!', info);
        res.status(200).send('Email sent successfully!');
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
