# Iqoma Gumelar Portfolio — Clean Rebuild

This is a clean, English-only static portfolio for GitHub Pages.

## Main files

```text
index.html                # Homepage
portfolio-detail.html     # Dynamic case study detail page
portfolio-detail.js       # Renders detail content based on project id
style.css                 # All visual styling, responsive rules, dark/light mode
app.js                    # Homepage interaction and content rendering
admin.html                # Simple browser CMS panel
cms.js                    # CMS editor/export logic
data/portfolio-data.json  # Portfolio content
assets/                   # Project images
```

## How to publish to GitHub Pages

1. Upload all files to the root of your repository.
2. The homepage must be in the root as `index.html`.
3. Go to GitHub repository `Settings > Pages`.
4. Choose `Deploy from a branch`.
5. Choose `main` and `/root`.
6. Save and wait for deployment.

## Portfolio detail page

Each card opens a case study page with this format:

```text
portfolio-detail.html?id=palace-park-pos-system
```

The page reads content from `data/portfolio-data.json`.

## Updating content

Open `admin.html`, edit the content, then click `Export JSON`.
Replace this file in GitHub:

```text
data/portfolio-data.json
```

## Notes

- Public visitors do not see the CMS link.
- Dark/light mode is saved in browser localStorage.
- The project is static and safe for GitHub Pages.
- Do not store passwords or private tokens in any JavaScript file.


## UX polish check

This build includes a cleaned homepage, compact portfolio cards, a dedicated `portfolio-detail.html` case study page, working dark/light mode, improved detail navigation, corrected list rendering, and responsive layouts for desktop, tablet, and mobile.


## Contact Update

WhatsApp direct link has been added: `https://wa.me/6285819720214`.


## CMS Photo Upload for Works

The CMS now includes a drag-and-drop photo upload area for each portfolio/work item.

Supported file types:

```text
PNG, JPG, WebP
```

Recommended size:

```text
Under 2MB
```

When you upload a photo in `admin.html`, the CMS stores it as image data inside the exported `portfolio-data.json`. After editing, click **Export JSON**, then replace `data/portfolio-data.json` in GitHub and commit the change.

You can still use a manual image path, for example:

```text
assets/project-name.webp
```

Use manual paths if you prefer uploading optimized images directly into the `assets/` folder.


## Stable repair build

This build includes complete JavaScript files (`app.js`, `portfolio-detail.js`, `cms.js`), system/light/dark theme support, portfolio detail pages, and CMS photo upload. Upload all files to the repository root, then commit and push.


## Brand Logo / Favicon

The top bar logo and browser favicon use `assets/iqoma-logo.svg`, with PNG fallbacks in the `assets/` folder.
