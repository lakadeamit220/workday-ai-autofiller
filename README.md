# Workday AI Autofiller

A smart, AI-powered Chrome Extension for automating job applications on Workday portals.

## Features

- **Resume Upload & Parsing**: Upload your resume in PDF or DOCX format. The extension extracts details like Name, Email, Phone, Location, Work Experience, Education, Skills, etc.
- **AI-Based Resume Understanding**: Uses OpenAI to convert raw resume text into clean, structured JSON, inferring missing info and normalizing formats.
- **Workday Form Automation**: Handles multi-step wizards, dynamic fields, conditional logic, and repeatable sections on Workday.
- **AI-Driven Field Mapping**: Intelligently reads field labels and semantically matches them to resume data. Automatically generates answers for tricky custom questions.
- **Safe Submission Workflow**: Navigates through all steps, showing a final review screen. **Only submits after explicit user confirmation.**

## Architecture

- **Popup (UI)**: Built with HTML, JS, and Tailwind CSS. Acts as the control center.
- **Background Service Worker**: Handles OpenAI API calls and data storage (`chrome.storage.local`).
- **Content Scripts**: Injected into Workday pages for DOM manipulation, dynamic field detection, and smart form filling.

## Installation & Setup

*(Detailed setup instructions will be added here as the build process is finalized)*

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Add your OpenAI API key to the environment setup.
4. Build the extension.
5. Load the unpacked extension in Chrome via `chrome://extensions/`.

## Development Stack

- Chrome Extension Manifest V3
- Plain HTML + Vanilla JS + Tailwind CSS
- OpenAI API (Structured Outputs)
- `pdfjs-dist` & `mammoth` for document parsing

## Limitations & Edge Cases

- **Authentication**: Bypassing Workday authentication is not supported. Users must log in manually before the extension begins filling forms.
- **Heavy UI Changes**: While the AI semantic mapping is highly adaptable, severe structural changes to the Workday DOM might require updates to the content observer scripts.
