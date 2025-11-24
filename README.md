<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to GitHub Pages.

View your app in AI Studio: https://ai.studio/apps/drive/1MXfU1kzJlJg0-Y7cEzxNxrxedXF2VFI4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This app is configured to deploy automatically to GitHub Pages at https://opj161.github.io/cadence-3.

### Setup (One-time)

1. Go to your repository Settings → Pages
2. Under "Build and deployment", set Source to "**GitHub Actions**"

### Deployment

The app will automatically deploy when you push to the `main` branch. You can also trigger a manual deployment:

1. Go to Actions tab in your repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

The deployment typically takes 1-2 minutes to complete.
