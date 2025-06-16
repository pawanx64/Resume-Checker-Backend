// backend/server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const uploadRoutes = require('./src/routes/uploadRoutes'); // Import your routes

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(
    cors({
        // Ensure to include your Vercel frontend URL and localhost for local development
        origin: ["https://resume-checker-frontend-puce.vercel.app", "http://localhost:3000"],
        methods: ["POST", "GET"], // Explicitly allow POST and GET methods
        credentials: true, // Allow cookies/auth headers if needed
    })
);
app.use(express.json()); // For parsing application/json
app.use(fileUpload());   // For handling multipart/form-data (file uploads)

// --- Routes ---

// 1. Basic server check route - THIS MUST COME BEFORE MORE GENERAL app.use() CALLS
//    This ensures that a GET request to '/' is handled directly here.
app.get('/', (req, res) => {
    console.log('Root path accessed: Server is running ✅'); // Add console log for Vercel debugging
    res.send('Server is running ✅');
});

// 2. Use your upload routes, but with an API prefix.
//    This means all routes in uploadRoutes.js will now be under /api/
//    For example, router.post('/upload') will be accessible at /api/upload
app.use('/api', uploadRoutes);

// --- Error Handling (Good Practice) ---
// Catch-all for unhandled routes (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ error: 'Something went wrong on the server.' });
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Backend URL for local testing: http://localhost:${port}`);
    console.log(`CORS allowed origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000 (default)'}`);
});
