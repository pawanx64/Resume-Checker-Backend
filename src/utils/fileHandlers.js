const fs = require('fs');
const path = require('path');
const os = require('os'); 

const UPLOADS_BASE_DIR = os.tmpdir(); 
const UPLOADS_DIR = path.join(UPLOADS_BASE_DIR, 'my-resume-uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true }); 
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
};