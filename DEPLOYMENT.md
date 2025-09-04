# GitHub Pages Deployment Guide

This guide will walk you through deploying your Productivity App to GitHub Pages.

## Prerequisites

- A GitHub account
- Your productivity app code pushed to a GitHub repository
- Repository name: `productivity-app` (or update the config if different)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

Make sure your code is pushed to the `main` branch of your GitHub repository.

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Click **Configure** if prompted

### 3. Configure GitHub Pages Settings

- **Source**: GitHub Actions
- **Branch**: main (should be automatic)
- **Custom domain**: Leave empty (optional)

### 4. Automatic Deployment

The GitHub Actions workflow will automatically:
- Build your Next.js app
- Deploy it to GitHub Pages
- Update on every push to main branch

### 5. Access Your App

Your app will be available at:
```
https://[your-username].github.io/productivity-app/
```

## Configuration Details

### Next.js Config
- `output: 'export'` - Generates static files
- `trailingSlash: true` - Adds trailing slashes for GitHub Pages compatibility
- `basePath: '/productivity-app'` - Matches repository name
- `assetPrefix` - Ensures assets load correctly

### Build Process
- Runs `npm run build` which creates static files in `out/` directory
- GitHub Actions uploads these files to GitHub Pages

## Troubleshooting

### Common Issues

1. **404 Errors**: Ensure `basePath` matches your repository name exactly
2. **Assets Not Loading**: Check that `assetPrefix` is set correctly
3. **Build Failures**: Verify all dependencies are in `package.json`

### Manual Deployment

If you need to deploy manually:

```bash
npm run build
# Upload the contents of the 'out' folder to GitHub Pages
```

### Check Deployment Status

1. Go to **Actions** tab in your repository
2. Look for the "Deploy to GitHub Pages" workflow
3. Check for any build or deployment errors

## Local Testing

Test the production build locally:

```bash
npm run build
npm run start
```

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify your repository settings
3. Ensure all configuration files are committed

## Notes

- The app will be completely static (no server-side features)
- All data is stored in localStorage (works offline)
- Updates require a new deployment (push to main branch) 