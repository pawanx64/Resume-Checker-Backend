const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function extractTextFromResume(filePath, mimeType) { 
    if (mimeType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } else {
        throw new Error("Unsupported file type. Only PDF and DOCX files are allowed.");
    }
}

module.exports = {
    extractTextFromResume 
};