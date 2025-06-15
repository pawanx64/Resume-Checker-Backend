// backend/src/controllers/uploadController.js
const geminiModel = require('../config/gemini');
const { extractTextFromResume } = require('../models/resumeModel');
const { moveUploadedFile, deleteFile } = require('../utils/fileHandlers');

const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const uploadResume = async (req, res) => {
    let uploadPath; // Declare outside try block for finally access

    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const resumeFile = req.files.file;

        // File Type Validation
        if (!allowedMimeTypes.includes(resumeFile.mimetype)) {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF (.pdf) or DOCX (.docx) file.' });
        }

        // Move and save file temporarily
        uploadPath = await moveUploadedFile(resumeFile);

        // Extract text from the resume
        let resumeText;
        try {
            resumeText = await extractTextFromResume(uploadPath, resumeFile.mimetype);
        } catch (extractionError) {
            console.error("Error extracting text:", extractionError);
            return res.status(400).json({ error: "Could not extract text from the file. Please ensure it's a valid PDF or DOCX." });
        }

        // Define the prompt for Gemini
        const prompt = `You are an expert resume reviewer and an Applicant Tracking System (ATS).
        Analyze the following resume text and provide a comprehensive review.

        Resume Text:
        ---
        ${resumeText}
        ---

        Provide the analysis in a JSON object with the following keys:
        1.  \`score\`: An integer representing a score out of 100 for the resume's overall quality and effectiveness.
        2.  \`strengths\`: A list of key strengths identified in the resume (e.g., "Strong action verbs", "Clear quantifiable achievements").
        3.  \`weaknesses\`: A list of areas where the resume could be improved (e.g., "Lack of specific metrics", "Generic objective statement").
        4.  \`tips_for_improvement\`: A list of actionable tips to enhance the resume (e.g., "Quantify achievements with numbers and percentages", "Tailor summary to target job descriptions").
        5.  \`summary\`: A concise, professional summary of the resume's main highlights.

        Ensure the response is valid JSON.`;

        // Make the call to the Gemini API
        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text();

        // Attempt to parse the JSON response from Gemini
        let geminiAnalysis;
        try {
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                geminiAnalysis = JSON.parse(jsonMatch[1]);
            } else {
                geminiAnalysis = JSON.parse(responseText);
            }
        } catch (jsonParseError) {
            console.error("Failed to parse Gemini response as JSON:", responseText, jsonParseError);
            return res.status(500).json({ error: "Failed to parse Gemini analysis. Raw response: " + responseText });
        }

        res.json({ analysis: geminiAnalysis });

    } catch (error) {
        console.error("Server error during file upload and analysis:", error);
        // Ensure to delete the file even if a later error occurs
        if (uploadPath) {
            deleteFile(uploadPath);
        }
        res.status(500).json({ error: 'An internal server error occurred during analysis.' });
    } finally {
        // Always attempt to delete the temporary file if it was moved
        if (uploadPath) {
            deleteFile(uploadPath);
        }
    }
};

module.exports = {
    uploadResume
};