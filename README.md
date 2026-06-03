# Workday AI Autofiller

An AI-powered Chrome Extension that automates job applications on Workday portals. It intelligently parses your resume (PDF/DOCX) locally in the browser and uses modern LLMs (Google Gemini, Groq, or OpenAI) to semantically map your details to dynamic Workday forms, bypassing complex React controlled inputs to fill out your application automatically.

## Features

- **Multi-Provider AI Brain**: Supports **Google Gemini 2.0 Flash** (Free), **Groq Llama 3.3** (Free), and **OpenAI GPT-4o-mini** (Paid). Choose your preferred engine directly in the UI!
- **Modern, Soft UI**: A beautiful, clean, light-themed popup interface built with Tailwind CSS v4.
- **Local Resume Parsing**: Extracts text from PDF and DOCX files securely inside your browser using `pdfjs-dist` (with locally bundled Web Workers to respect Chrome CSP) and `mammoth`.
- **AI Semantic Mapping**: Uses AI to understand form fields and contextually map them to your resume data, handling dynamic dropdowns and radios.
- **Smart Form Filling**: Interacts with React's virtual DOM by overriding the `nativeInputValueSetter` to ensure Workday actually registers and saves the inputted data.
- **Auto-Navigation**: Detects current application steps and automatically clicks "Save and Continue" to progress through the multi-page wizard.
- **Privacy-First**: Your API keys and parsed resume data are stored securely in Chrome's local storage (`chrome.storage.local`).

## Setup & Installation

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
   *This will generate a `dist/` directory containing the bundled extension.*

4. **Load into Chrome**:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** in the top right corner.
   - Click **Load unpacked** and select the newly created `dist/` folder in your project directory.

## Usage

1. Click the extension icon (💼) in your Chrome toolbar.
2. Select your preferred **AI Provider** (Gemini, Groq, or OpenAI) from the dropdown. 
3. Paste your API Key and hit Save. *(The UI includes links to grab a free key for Gemini and Groq!)*
4. Upload your resume (PDF or DOCX). Wait for the AI to parse it into structured data.
5. Navigate to any **Workday job application page** (e.g., `*.myworkdayjobs.com`) and ensure you are logged in and starting an application.
6. Click **Start Autofill on Workday** in the extension popup.
7. Sit back and watch! The extension will automatically fill fields and proceed to the next steps. It will automatically stop when it reaches the final "Review" page so you can verify the information before manual submission.

## Architecture & Tech Stack

- **Framework**: Vite + React + Tailwind CSS v4
- **Extension API**: Manifest V3 + `@crxjs/vite-plugin`
- **Parsers**: `pdfjs-dist` (PDF via bundled Web Worker), `mammoth` (DOCX)
- **AI**: Native `fetch()` wrappers in the Background Service Worker

### AI Prompting Strategy

The extension utilizes two distinct prompts for maximum accuracy:
1. **Resume Parser**: Extracts structured, normalized JSON from raw document text, inferring implicit data and formatting dates.
2. **Field Mapper**: Receives a serialized snapshot of the visible DOM fields and maps them to the parsed JSON using semantic similarity and confidence thresholds, intelligently handling dynamic dropdowns and Workday-specific quirks.

## Known Limitations

- You must manually create an account and log in to the specific Workday portal before starting.
- Due to the highly customized nature of some Workday implementations, some custom fields may not be detected perfectly.
- The extension purposely stops at the Review step—it will not auto-submit your application without your final approval.
