// backend/src/utils/fileHandlers.js
const fs = require('fs');
const path = require('path');
const os = require('os'); // <--- ADD THIS LINE: Import the 'os' module

// Use the system's temporary directory for uploads
// It's good practice to create a subdirectory within tmpdir for your app's files
const UPLOADS_BASE_DIR = os.tmpdir(); // <--- CHANGE: Get the system's temporary directory
const UPLOADS_DIR = path.join(UPLOADS_BASE_DIR, 'my-resume-uploads'); // <--- CHANGE: Create a specific subdirectory within temp

// Ensure the temporary uploads directory exists *within the temporary path*
// This mkdirSync will now succeed because os.tmpdir() is writeable.
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true }); // <--- CHANGE: Add { recursive: true } for robustness
}

async function moveUploadedFile(uploadedFile) {
    const uploadPath = path.join(UPLOADS_DIR, uploadedFile.name);
    // express-fileupload's .mv() method should work correctly with the temporary path.
    await uploadedFile.mv(uploadPath);
    return uploadPath;
}

function deleteFile(filePath) {
    // It's crucial to delete temporary files after use to free up space
    // and avoid hitting potential limits in the serverless environment.
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    moveUploadedFile,
    deleteFile,
    // UPLOADS_DIR // You can still export this if other parts of your code need it,
                 // but it's less common to need it directly outside this module now.
                 // I'll keep it commented out for now as it's often not necessary.
};