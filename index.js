require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: ["https://resume-checker-frontend-puce.vercel.app","http://localhost:5173"],
        methods: ["POST", "GET"],
        credentials: true,
    })
);
app.use(express.json());
app.use(fileUpload());

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

app.get("/", (req, res) => {
    console.log('Homepage route hit!');
    res.send(`<h1>This Is HomePage</h1>`);
});

app.use('/', uploadRoutes);

app.use((err, req, res, next) => {
    console.error('An error occurred:', err.stack);
    res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.use((req, res, next) => {
    console.log(`404 Not Found for: ${req.originalUrl}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
    console.log(`✅ Server started at http://localhost:${port}`);
});
