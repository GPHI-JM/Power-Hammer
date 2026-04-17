# Facebook Instant Games Deployment Guide

## Build & Bundle Steps

### 1. Build the Project
```bash
npm run build
```

This generates the `dist/` folder with all assets and code.

### 2. Create Bundle
```bash
node create-bundle.js
```

This creates `bundle.zip` containing:
- `index.html` (entry point with FBInstant SDK)
- `fbapp-config.json` (game configuration)
- `assets/` folder (JavaScript & CSS)
- All image files (bg.png, puck.png, etc.)

## Uploading to Facebook Instant Games

### ✓ Correct Way
1. Go to Facebook Developer Console → Your Instant Game App
2. Click **"Upload New Version"** button
3. **Select the `bundle.zip` file** (located in project root)
4. File size limit: 200 MB ✓ (our bundle is ~11 MB)
5. Click **Upload**

### ✗ Wrong Way (Common Mistake)
- Do NOT upload individual files from the `dist/` folder
- Do NOT upload the `dist/` folder itself
- Do NOT try to upload multiple files at once
- **Only upload the single `bundle.zip` file**

## Bundle Contents Verification

Check what's inside the zip before uploading:
```bash
unzip -l bundle.zip
```

Should contain (at root level):
```
index.html (552 bytes)
fbapp-config.json (284 bytes)
assets/ (folder with JS/CSS)
bg.png, puck.png, cursor-hammer.svg, etc.
```

✓ Should NOT contain:
- `.DS_Store` files
- `node_modules/`
- `src/` folder
- `.git/` folder

## After Upload

Once uploaded successfully:
1. Facebook will show upload progress
2. Game will be available to test in Messenger/Facebook
3. Check the "Testers" section to send test invites
4. Monitor console for any FBInstant errors

## Troubleshooting

### If upload fails:
1. Verify bundle.zip is selected (not individual files)
2. Check file size is under 200 MB
3. Ensure fbapp-config.json is valid JSON
4. Check browser console for any immediate errors

### Clean rebuild:
```bash
rm -rf dist/ bundle.zip
npm run build
node create-bundle.js
```

## Key Configuration Files

**vite.config.js**
- Sets `base: './'` for relative paths
- FBInstant SDK is always included in `index.html`
- Automatic cleanup of dist folder before each build

**fbapp-config.json**
- Platform: RICH_GAMEPLAY
- Navigation: NAV_FLOATING
- Orientation: PORTRAIT
- Display name and game type configured

**index.html**
- Loads FBInstant SDK from Facebook CDN
- Relative asset paths (./assets/...)
- Vue app mounts to #app

## Notes

- `.DS_Store` files are automatically excluded from bundles (macOS)
- All file paths use forward slashes for web compatibility
- Build is minified and optimized for production
- FBInstant initialization with 12-second timeout
