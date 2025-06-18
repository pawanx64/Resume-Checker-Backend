const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set in your .env file! Please get one from https://aistudio.google.com/app/apikey");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

module.exports = geminiModel;