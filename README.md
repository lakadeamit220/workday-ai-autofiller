# Workday AI Autofiller

An AI-powered Chrome Extension that automates job applications on Workday portals. The extension reads your resume locally in the browser and uses AI (Google Gemini, Groq, or OpenAI) to map your details to Workday forms. It bypasses complex React inputs to fill out your application automatically.

## Features

- **Multiple AI Providers**: Supports Google Gemini 2.0 Flash (Free), Groq Llama 3.3 (Free), and OpenAI GPT-4o-mini (Paid). You can select your preferred provider directly in the user interface.
- **Modern Interface**: A clean, light-themed popup interface built with React and Tailwind CSS v4.
- **Local Data Parsing**: Extracts text from PDF and DOCX files securely inside your browser. This ensures privacy as your documents are never sent to external servers for text extraction.
- **Contextual Form Filling**: Uses AI to understand the context of form fields and maps them to your resume data. It handles dynamic dropdowns, radio buttons, and text inputs.
- **React Input Handling**: Interacts directly with the React virtual DOM to ensure Workday registers and saves the inputted data correctly.
- **Automated Navigation**: Detects the current application step and automatically clicks the "Save and Continue" button to progress through the application wizard.
- **Privacy Focused**: Your API keys and parsed resume data are stored securely in Chrome's local storage.

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lakadeamit220/workday-ai-autofiller.git
   cd workday-ai-autofiller
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```
   This will generate a `dist/` directory containing the production-ready extension files.

4. **Load into Chrome**:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** in the top right corner.
   - Click **Load unpacked** and select the newly created `dist/` folder in your project directory.

## Usage

1. Click the extension icon in your Chrome toolbar to open the popup.
2. Select your preferred AI Provider (Gemini, Groq, or OpenAI) from the dropdown menu.
3. Paste your API Key and click Save. The interface includes links to generate free keys if needed.
4. Upload your resume (PDF or DOCX). Wait a few seconds for the AI to parse it into structured data.
5. Navigate to any Workday job application page (e.g., `*.myworkdayjobs.com`). Ensure you are logged in and have started an application.
6. Click the **Start Autofill on Workday** button in the extension popup.
7. The extension will automatically fill the fields and proceed to the next steps. It is programmed to stop when it reaches the final "Review" page so you can verify the information before submitting.

## Architecture and Tech Stack

- **Framework**: Vite, React, Tailwind CSS v4
- **Extension API**: Manifest V3, `@crxjs/vite-plugin`
- **Parsers**: `pdfjs-dist` (PDF extraction via bundled Web Worker), `mammoth` (DOCX extraction)
- **AI Integration**: Native `fetch()` calls handled securely in the Background Service Worker

### AI Implementation

The extension utilizes two distinct AI prompts to ensure accuracy:
1. **Resume Parser**: Extracts structured JSON data from the raw document text. It infers implicit data and standardizes date formats.
2. **Field Mapper**: Analyzes a snapshot of the visible form fields on the webpage and maps them to the structured resume data. It uses confidence thresholds to handle dynamic dropdowns and Workday-specific variations.

## Known Limitations

- You must manually create an account and log in to the specific Workday portal before starting the autofill process.
- Due to the highly customized nature of some Workday implementations, specific custom fields may not be detected perfectly.
- The extension purposely stops at the Review step. It will not submit the application without your manual approval.
