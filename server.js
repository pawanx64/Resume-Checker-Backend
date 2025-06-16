// backend/server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const uploadRoutes = require('./src/routes/uploadRoutes'); // Import your routes

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin:["https://resume-checker-frontend-puce.vercel.app"],
        methods:["POST","GET"],
        credentials: true,
    })
);
app.use(express.json());
app.use(fileUpload());

// Routes
app.use('', uploadRoutes); // Use your routes

// Basic server check route
app.get('/', (req, res) => {
    res.send('Server is running ✅');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Backend URL: http://localhost:${port}`);
});