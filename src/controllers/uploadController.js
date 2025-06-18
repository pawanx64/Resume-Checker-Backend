
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
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const resumeFile = req.files.file;

        if (!allowedMimeTypes.includes(resumeFile.mimetype)) {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or DOCX file.' });
        }

        uploadPath = await moveUploadedFile(resumeFile);

        let resumeText;
        try {
            resumeText = await extractTextFromResume(uploadPath, resumeFile.mimetype);
        } catch (err) {
            console.error("❌ Text extraction failed:", err);
            return res.status(400).json({
                error: "Failed to extract text. Ensure the document is not corrupted or empty."
            });
        }

        const prompt = `
You are an expert resume reviewer and an Applicant Tracking System (ATS).
Analyze the following resume content and return a JSON response with the following structure:

{
  "score": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "tips_for_improvement": [string],
  "summary": string,
  "modifications": [
    {
      "original": string,
      "updated": string
    }
  ]
}

Feel free to suggest any modifications you would like to make in the resume. For each suggested modification, provide both the original text snippet and your recommended updated text snippet.

Resume Content:
---------------------
${resumeText}
---------------------

Make sure your response is valid JSON without any explanation or extra formatting.
`;

        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text().trim();

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

        res.status(200).json({
            message: "Resume analyzed successfully.",
            analysis: geminiAnalysis
        });

    } catch (err) {
        console.error("🔥 Internal server error during resume upload/analysis:", err);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    } finally {
        if (uploadPath) {
            deleteFile(uploadPath);
        }
    }
};

module.exports = {
    uploadResume
};