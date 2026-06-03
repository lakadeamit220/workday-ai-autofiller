# Workday AI Autofiller

An AI-powered Chrome Extension that automates job applications on Workday portals. It intelligently parses your resume (PDF/DOCX) locally in the browser and uses OpenAI's GPT models to semantically map your details to dynamic Workday forms, bypassing complex React controlled inputs to fill out your application automatically.

## Features

- **Resume Parsing**: Extracts text from PDF and DOCX files directly in the browser using `pdfjs-dist` and `mammoth`.
- **AI Semantic Mapping**: Uses OpenAI (`gpt-4o-mini`) to understand form fields and contextually map them to your resume data.
- **Smart Form Filling**: Interacts with React's virtual DOM by overriding `nativeInputValueSetter` to ensure Workday saves the inputted data.
- **Auto-Navigation**: Detects current application steps and automatically clicks "Save and Continue" to progress through the multi-page wizard.
- **Privacy-First**: Your API key and parsed resume data are stored securely in Chrome's local storage (`chrome.storage.local`).

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

1. Click the 🚀 extension icon in your Chrome toolbar.
2. Enter your **OpenAI API Key** and hit Save. (Your key is stored locally).
3. Upload your resume (PDF or DOCX). Wait for the AI to parse it into a structured format.
4. Navigate to any **Workday job application page** (e.g., `*.myworkdayjobs.com`) and ensure you are logged in and starting an application.
5. Click **Start Autofill on Workday** in the extension popup.
6. Sit back and watch! The extension will automatically fill fields and proceed to the next steps. It will automatically stop when it reaches the final "Review" page so you can verify the information before manual submission.

## Architecture & Tech Stack

- **Framework**: Vite + React + Tailwind CSS v4
- **Extension API**: Manifest V3 + `@crxjs/vite-plugin`
- **Parsers**: `pdfjs-dist` (PDF), `mammoth` (DOCX)
- **AI**: Raw `fetch()` integration with OpenAI REST API (Service Worker)

### AI Prompting Strategy

The extension utilizes two distinct prompts for maximum accuracy:
1. **Resume Parser**: Extracts structured, normalized JSON from raw document text, inferring implicit data and formatting dates.
2. **Field Mapper**: Receives a serialized snapshot of the visible DOM fields and maps them to the parsed JSON using semantic similarity and confidence thresholds, intelligently handling dynamic dropdowns and Workday-specific quirks.

## Known Limitations

- You must manually create an account and log in to the specific Workday portal before starting.
- Due to the highly customized nature of some Workday implementations, some custom fields may not be detected perfectly.
- The extension purposely stops at the Review step—it will not auto-submit your application without your final approval.
