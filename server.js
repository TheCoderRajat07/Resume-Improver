// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse'); // Library for PDF parsing
const DocxReader = require('docx'); // Placeholder, docx library usage varies
const { GoogleGenerativeAI } = require('@google/generative-ai'); // <-- Import Gemini library
require('dotenv').config(); // Optional: Use dotenv for local environment variables





const app = express();
const port = 3000; // Keep the port defined


let electronAppPath = '';
if (process.versions && process.versions.electron) {
    // If running in Electron, require the 'app' module
    const { app } = require('electron');
    // Get the user data path provided by Electron
    electronAppPath = app.getPath('userData');
    console.log(`Running in Electron. User data path: ${electronAppPath}`);
} else {
     console.log(`Running as standalone web server.`);
}
// --- Determine the base upload directory ---
// Use the user data path in Electron, or the local 'uploads' dir otherwise
const UPLOAD_BASE_DIR = electronAppPath ? path.join(electronAppPath, 'app_uploads') : path.join(__dirname, 'uploads');
// We use 'app_uploads' inside user data to keep things organized

// ... (rest of imports, api key setup, model setup) ...

// --- Multer Configuration ---
// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use the determined base upload directory
        const uploadPath = UPLOAD_BASE_DIR;

        // Create the directory if it doesn't exist
        // Use synchronous mkdirSync, but handle potential race conditions if multiple
        // processes tried to create it simultaneously (less likely for a desktop app)
        try {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true }); // Use recursive: true for safety
                console.log(`Created upload directory: ${uploadPath}`);
            }
             cb(null, uploadPath); // Directory to save uploaded files
        } catch (error) {
            console.error(`Error creating upload directory ${uploadPath}: ${error}`);
            cb(error); // Pass the error to multer
        }
    },
    filename: function (req, file, cb) {
        // Use a unique filename to avoid conflicts, e.g., timestamp + original name
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Create the multer instance
const upload = multer({ storage: storage });


// --- Load Gemini API Key from Environment Variables ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not found in environment variables.");
    console.error("Please set the GEMINI_API_KEY environment variable.");
    process.exit(1); // Exit if the API key is not set
}

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Use a model suitable for text generation
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"}); // Or "gemini-1.0-pro", check documentation for best model



// --- Middleware ---
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

// --- Resume Parsing Function (Keep this largely the same) ---
async function parseResume(filePath, fileType) {
    console.log(`Attempting to parse file: ${filePath} with type: ${fileType}`);
    try {
        const fileBuffer = fs.readFileSync(filePath);
        let content = '';

        if (fileType === 'application/pdf') {
            const data = await pdf(fileBuffer);
            content = data.text;
            console.log('PDF parsed successfully.');
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
             // --- Improved DOCX Parsing (requires 'mammoth' or similar) ---
             // You would typically use a library like 'mammoth' for robust DOCX parsing
             // npm install mammoth
             /*
             const mammoth = require('mammoth');
             const result = await mammoth.extractRawText({buffer: fileBuffer});
             content = result.value; // The raw text
             console.log('DOCX parsed successfully using mammoth.');
             */
             // --- Placeholder if mammoth is not installed/used ---
             content = "Mock DOCX content: Placeholder - Integrate a DOCX parsing library like 'mammoth' for real content extraction.";
             console.log('DOCX parsing placeholder used.');

        } else {
            console.warn(`Unsupported file type: ${fileType}`);
            content = `Could not parse file type: ${fileType}. Supported types: PDF, DOCX.`;
        }
        // Clean up the uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
            else console.log(`Deleted processed file: ${filePath}`);
        });

        return content;

    } catch (error) {
        console.error(`Error parsing resume file: ${error}`);
        // Clean up the file even if parsing fails
         fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file after parse error: ${err}`);
            else console.log(`Deleted file after parse error: ${filePath}`);
        });
        throw new Error('Failed to parse resume file.');
    }
}


// --- New: Analyze with Gemini Function ---
async function analyzeResumeWithGemini(resumeText, role, experience, skills) {
    console.log("Calling Gemini API for analysis...");

    // Craft the prompt for Gemini (keep the prompt the same)
    const prompt = `
You are an AI resume and career advisor. Analyze the provided resume content, the target job role, the user's summarized work experience, and their skills. Provide personalized feedback and advice to help the user improve their resume and prepare for interviews for the specified role.

Provide the output in clearly labeled sections:
1.  **Analysis & Score (0-100):** Provide a brief analysis of how well the resume content aligns with the target role and provided details. Based on this analysis and the overall quality/relevance, give a hypothetical selection score between 0 and 100. This score is an estimate based on the provided text and should be seen as indicative, not definitive.
2.  **Resume Improvement Suggestions:** Provide specific, actionable suggestions to improve the resume content for the "${role}" role. Use bullet points. Refer to the provided resume text, experience, and skills in your suggestions.
3.  **Interview Preparation Tips:** Provide customized tips for preparing for interviews for the "${role}" role, referencing the user's experience and skills. Use bullet points.

---
Resume Content:
${resumeText}

---
Target Role:
${role}

---
Summarized Work Experience (provided by user):
${experience}

---
Key Skills (provided by user):
${skills}
`;

    try {
        // Send the prompt to the Gemini model
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text(); // Use 'let' because we'll trim it

        console.log("Gemini API call successful.");
        console.log("Raw Gemini Response:\n", text); // Keep logging for debugging if needed

        // --- More Robust Parsing of Gemini's Response ---
        text = text.trim(); // Trim leading/trailing whitespace from the whole response

        const suggestionsHeading = '**2. Resume Improvement Suggestions:**';
        const tipsHeading = '**3. Interview Preparation Tips:**';

        const suggestionsIndex = text.indexOf(suggestionsHeading);
        const tipsIndex = text.indexOf(tipsHeading);

        let score = 0;
        let analysisText = "";
        let rawSuggestions = [];
        let rawTips = [];

        // Check if headings were found
        if (suggestionsIndex === -1 || tipsIndex === -1 || tipsIndex < suggestionsIndex) {
            console.error("Could not find expected headings in Gemini response.");
             // Attempt to parse score even if headings aren't perfectly found
             const scoreMatch = text.match(/Score \(0-100\):\s*(\d+)/);
             if (scoreMatch && scoreMatch[1]) {
                 score = parseInt(scoreMatch[1], 10);
                 score = Math.min(100, Math.max(0, score));
             } else {
                 score = 50; // Default score if parsing fails entirely
             }
             // Return default empty arrays for suggestions and tips
            return {
                score: score,
                analysis: "Could not fully parse AI response format.",
                suggestions: [],
                interviewTips: []
            };
        }

        // Extract Analysis section
        const analysisSection = text.substring(0, suggestionsIndex).trim();

        // Extract Suggestions section
        const suggestionsSection = text.substring(suggestionsIndex + suggestionsHeading.length, tipsIndex).trim();

        // Extract Interview Tips section
        const tipsSection = text.substring(tipsIndex + tipsHeading.length).trim();


        // Parse Score from Analysis section
        const scoreMatch = analysisSection.match(/Score \(0-100\):\s*(\d+)/);
        if (scoreMatch && scoreMatch[1]) {
            score = parseInt(scoreMatch[1], 10);
            score = Math.min(100, Math.max(0, score)); // Ensure score is 0-100
        } else {
            console.warn("Could not find a numerical score in Gemini's analysis section, defaulting to 50.");
            score = 50; // Default score if parsing fails
        }

        // Parse Suggestions (split by bullet points)
        // Split by '* ' and filter out any empty resulting strings, trim each item
        rawSuggestions = suggestionsSection.split('* ').map(item => item.trim()).filter(item => item.length > 0);

        // Parse Interview Tips (split by bullet points)
        // Split by '* ' and filter out any empty resulting strings, trim each item
        rawTips = tipsSection.split('* ').map(item => item.trim()).filter(item => item.length > 0);


        // Return the structured results
        return {
            score: score,
            analysis: analysisSection, // Include analysis text (optional)
            suggestions: rawSuggestions,
            interviewTips: rawTips
        };

    } catch (error) {
        console.error(`Error calling Gemini API or parsing response: ${error}`);
        // Depending on the error, you might want to return a specific message or default data
        // Ensure file cleanup is done (it's handled in parseResume)
        throw new Error(`AI analysis failed: ${error.message}`);
    }
}




// --- API Endpoint for Resume Analysis ---
app.post('/analyze-resume', upload.single('resumeFile'), async (req, res) => {
    console.log('Received request to /analyze-resume');

    if (!req.file) {
        console.error('No file uploaded.');
        // Clean up request body? No, multer handles it.
        return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const { role, experience, skills } = req.body;
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    if (!role || !experience || !skills) {
         // Clean up the uploaded file if other fields are missing
         fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting file after missing fields: ${err}`);
            else console.log(`Deleted file due to missing fields: ${filePath}`);
        });
        console.error('Missing required fields.');
        return res.status(400).json({ error: 'Missing required fields: role, work experience, or skills.' });
    }


    try {
        // 1. Parse the resume file
        const resumeText = await parseResume(filePath, fileType);

         if (!resumeText || resumeText.length < 50) { // Basic check if parsing failed or content is minimal
             console.warn('Resume parsing resulted in minimal text, proceeding with analysis but results may be poor.');
             // File cleanup is handled within parseResume
             // return res.status(400).json({ error: 'Could not extract enough text from the resume file. Please check the file format.' });
             // Decide if you want to fail here or proceed with minimal text.
             // Proceeding might give generic tips based on other fields.
        }


        // 2. Perform AI analysis using Gemini
        // Call the new Gemini analysis function instead of the mock one
        const analysisResults = await analyzeResumeWithGemini(resumeText || '', role, experience, skills); // Pass empty string if parsing failed


        // 3. Send results back to the client
        // Ensure the response structure matches what the frontend expects (score, suggestions, interviewTips)
         res.status(200).json({
            score: analysisResults.score, // Use the score extracted from Gemini's response
            suggestions: analysisResults.suggestions,
            interviewTips: analysisResults.interviewTips,
            analysisText: analysisResults.analysis // Optionally send the analysis text too
         });


    } catch (error) {
        console.error(`Server error during analysis: ${error}`);
        // File cleanup is attempted within parseResume even on error
        res.status(500).json({ error: 'An error occurred during resume analysis: ' + error.message });
    }
});

// --- Start Server ---
const serverInstance = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Export the server instance for Electron
module.exports = serverInstance;