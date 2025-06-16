// backend/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const uploadRoutes = require('./src/routes/uploadRoutes'); // Import your routes

const app = express();
const port = process.env.PORT || 5000; // Use port from environment variable or default to 5000

// --- Middleware ---
// CORS configuration to allow requests from your frontend
app.use(
    cors({
        origin: ["https://resume-checker-frontend-puce.vercel.app", "http://localhost:3000"], // Added localhost for local development
        methods: ["POST", "GET"], // Specify allowed HTTP methods
        credentials: true, // Allow cookies and authentication headers
    })
);

// Body parser for JSON requests
app.use(express.json());

// File upload middleware for handling multipart/form-data
app.use(fileUpload());

// --- Routes ---

// Basic server check route - placed before other routes to ensure it's hit for '/'
app.get('/', (req, res) => {
    console.log('Root path accessed'); // Log for debugging
    res.send('Server is running ✅');
});

// Use your upload routes for API endpoints
// This will make routes defined in uploadRoutes available at /api/upload, for example
// if uploadRoutes contains router.post('/upload', ...)
app.use('/api', uploadRoutes);

// --- Error Handling (Optional but Recommended) ---
// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).send('Something broke!');
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Backend URL: http://localhost:${port}`); // For local testing
    console.log('CORS origin allowed:', process.env.CORS_ORIGIN || "http://localhost:3000");
});
