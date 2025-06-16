// backend/src/utils/fileHandlers.js
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

async function moveUploadedFile(uploadedFile) {
    const uploadPath = path.join(UPLOADS_DIR, uploadedFile.name);
    await uploadedFile.mv(uploadPath);
    return uploadPath;
}

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    moveUploadedFile,
    deleteFile,
    UPLOADS_DIR // Export if needed elsewhere
};