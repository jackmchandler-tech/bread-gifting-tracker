# Bread Gifting Tracker

A deployable React + Vite version of your bread gifting tracker.

## Run locally

1. Install Node.js 18+
2. Open a terminal in this folder
3. Run:

```bash
npm install
npm run dev
```

4. Open the local URL shown by Vite

## Build for deployment

```bash
npm install
npm run build
```

The production files will be created in `dist/`.

## Deploy on Vercel

1. Create a free Vercel account
2. Create a new project
3. Upload this folder or connect a Git repository
4. Use the defaults:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

## Install on iPhone/iPad

After deployment:

1. Open the site in Safari
2. Tap Share
3. Tap Add to Home Screen

## Notes

- Data is stored in the browser's local storage
- Use the Backup JSON export regularly
- CSV import supports columns such as:
  - `name`
  - `associatedName`
  - `howMet`
  - `note`
  - `phone`
  - `listName`
