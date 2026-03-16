# Website Login Page Cloner v1

A powerful Node.js + Express + EJS application for cloning website login pages with built-in credential capture system.

## Features

- 🌐 **Clone Any Website** - Fetches and clones login pages from any URL
- 🚀 **Puppeteer Support** - Render JavaScript-based login pages
- 🔐 **Credential Capture** - Built-in system to capture and store test credentials
- ✏️ **Modify Form Actions** - Changes form submission to custom endpoint
- 📝 **Dynamic Form Injection** - Creates forms for JS-rendered inputs
- 👁️ **Live Preview** - Preview cloned sites before downloading
- ⬇️ **Download/Copy** - Easy download or copy to clipboard

## Tech Stack

| Technology | Description |
|------------|-------------|
| Node.js | Runtime environment |
| Express | Web framework |
| EJS | Template engine |
| Cheerio | HTML parsing |
| node-fetch | HTTP client |
| Puppeteer | JavaScript rendering |

## Installation

```bash
git clone https://github.com/fahimahamed1/website-cloner.git
cd website-cloner
npm install
npm start
```

Open http://localhost:3000 in your browser.

## Usage

1. **Enter URL** - Input the website login page URL
2. **Set Action** - Default `/login` captures credentials locally
3. **Select Mode** - Auto (recommended), Puppeteer, or Fetch Only
4. **Clone** - Click "Clone Website"
5. **Preview & Test** - Test the cloned login form
6. **View Credentials** - Check captured data at `/credentials`

## Project Structure

```
website-cloner/
├── src/
│   ├── server.js              # Main entry point
│   ├── config/
│   │   └── constants.js       # Configuration constants
│   ├── services/
│   │   ├── fetchService.js    # HTTP fetch logic
│   │   ├── puppeteerService.js# Puppeteer rendering
│   │   ├── formService.js     # Form processing
│   │   └── credentialService.js # Credential storage
│   └── routes/
│       ├── index.js           # Route aggregator
│       ├── viewRoutes.js      # Page routes
│       ├── cloneRoutes.js     # Clone API routes
│       └── loginRoutes.js     # Login capture routes
├── views/
│   └── index.ejs              # Main page template
├── public/
│   ├── css/style.css          # Styles
│   └── js/app.js              # Frontend logic
├── data/
│   └── credentials.json       # Stored credentials
└── package.json
```

## API Reference

### POST `/clone`
Clone a website and modify form actions.

```json
{
  "url": "https://example.com/login",
  "action": "/login",
  "modifyAllForms": false,
  "usePuppeteer": false,
  "waitTime": 5000
}
```

### POST `/login`
Receives captured credentials from cloned pages.

### GET `/credentials`
View all captured credentials.

### GET `/api/credentials`
API endpoint to retrieve credentials as JSON.

## Render Modes

| Mode | Description | Speed | Coverage |
|------|-------------|-------|----------|
| **Auto** | Fetch first, Puppeteer fallback | Fast | Best |
| **Puppeteer** | Full JavaScript rendering | Slow | Most sites |
| **Fetch Only** | HTTP fetch only | Fastest | HTML-only sites |

## Supported Sites

### ✅ Fully Working
- **Facebook** - `email`, `pass`
- **GitHub** - `login`, `password`
- **LinkedIn** - `session_key`, `session_password`

### ⚡ Puppeteer Mode
- **Twitter/X** - Dynamic form, username field

### ⚠️ Protected (Anti-bot)
- Instagram, Reddit, Google, Microsoft

## Legal Disclaimer

⚠️ **WARNING**: This tool is for educational and authorized testing purposes only.

- Only use on websites you own or have explicit permission to test
- Unauthorized use may violate computer fraud laws
- The creators are not responsible for misuse

## License

MIT License

## Author

Created by [@fahimahamed1](https://github.com/fahimahamed1)
