# Resume Improver

A powerful desktop application that helps you improve your resume using AI-powered analysis. Upload your resume, specify the job role you're applying for, and get personalized suggestions to enhance your resume and prepare for interviews.

![Resume Improver Screenshot](public/screenshot.png)

## 🚀 Features

- **Resume Analysis**: Upload your resume in PDF or DOCX format
- **AI-Powered Feedback**: Get personalized suggestions based on your resume content
- **Job-Specific Recommendations**: Tailored advice for your target role
- **Interview Preparation Tips**: Receive guidance to help you prepare for interviews
- **Selection Score**: Get a score indicating how well your resume matches the target role

## 📥 Installation

### Windows Users (Recommended)

1. Download the latest release from the [Releases](https://github.com/yourusername/resume-improver/releases) page
2. Run the `Resume-Improver-Setup.exe` installer
3. Follow the installation wizard
4. Launch the application from your desktop or start menu

### Manual Installation (Developers)

If you prefer to run the application from source:

```bash
# Clone the repository
git clone https://github.com/yourusername/resume-improver.git
cd resume-improver

# Install dependencies
npm install

# Start the application
npm start
```

## 🔧 Configuration

The application requires a Gemini API key to function. You can get one from the [Google AI Studio](https://makersuite.google.com/app/apikey).

1. Create a `.env` file in the root directory
2. Add your API key: `GEMINI_API_KEY=your_api_key_here`

## 💻 Usage

1. Launch the application
2. Upload your resume (PDF or DOCX format)
3. Enter the job role you're applying for
4. Provide a summary of your work experience
5. List your key skills
6. Click "Analyze Resume" to get personalized feedback

## 🛠️ Technologies Used

- Electron.js - Cross-platform desktop application framework
- Express.js - Backend server
- Google Generative AI (Gemini) - AI-powered resume analysis
- PDF-Parse - PDF file parsing
- Docx - DOCX file parsing

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Rajat Khairnar

## 🙏 Acknowledgments

- Google Generative AI for providing the Gemini API
- The Electron.js community for their excellent documentation 