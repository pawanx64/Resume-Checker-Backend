// backend/src/controllers/uploadController.js

const geminiModel = require('../config/gemini');
const { extractTextFromResume } = require('../models/resumeModel');
const { moveUploadedFile, deleteFile } = require('../utils/fileHandlers');

const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const uploadResume = async (req, res) => {
    let uploadPath;

    try {
        // Check if file exists
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const resumeFile = req.files.file;

        // Validate file type
        if (!allowedMimeTypes.includes(resumeFile.mimetype)) {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX file.' });
        }

        // Save the uploaded file temporarily
        uploadPath = await moveUploadedFile(resumeFile);

        // Extract text from the resume
        let resumeText;
        try {
            resumeText = await extractTextFromResume(uploadPath, resumeFile.mimetype);
        } catch (err) {
            console.error("❌ Text extraction failed:", err);
            return res.status(400).json({
                error: "Failed to extract text. Ensure the document is not corrupted or empty."
            });
        }

        // Gemini Prompt
        const prompt = `
You are an expert resume reviewer and an Applicant Tracking System (ATS).
Analyze the following resume content and return a JSON response with the following structure:

{
  "score": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "tips_for_improvement": [string],
  "summary": string
}

Resume Content:
---------------------
${resumeText}
---------------------

Make sure your response is valid JSON without any explanation or extra formatting.
`;

        // Gemini API call
        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON from Gemini response
        let geminiAnalysis;
        try {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            const rawJson = jsonMatch ? jsonMatch[1] : responseText;
            geminiAnalysis = JSON.parse(rawJson);
        } catch (err) {
            console.error("❌ Failed to parse Gemini JSON:", err);
            return res.status(500).json({
                error: 'Unable to parse response from Gemini. Please try again.',
                rawResponse: responseText
            });
        }

        // Send analysis
        res.status(200).json({
            message: "Resume analyzed successfully.",
            analysis: geminiAnalysis
        });

    } catch (err) {
        console.error("🔥 Internal server error during resume upload/analysis:", err);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    } finally {
        // Always delete temporary file
        if (uploadPath) {
            deleteFile(uploadPath);
        }
    }
};

module.exports = {
    uploadResume
};
