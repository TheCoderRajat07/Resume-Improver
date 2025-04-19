# GitHub Upload Guide

This guide will help you upload your Resume Improver project to GitHub and create a release with the Windows installer.

## Step 1: Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

## Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository "resume-improver"
4. Add a description: "A multi-platform app to improve resumes using AI"
5. Choose "Public" visibility
6. Do NOT initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 3: Connect and Push to GitHub

After creating the repository, GitHub will show you commands to connect your local repository. Run these commands:

```bash
git remote add origin https://github.com/yourusername/resume-improver.git
git branch -M main
git push -u origin main
```

Replace `yourusername` with your actual GitHub username.

## Step 4: Build the Windows Installer

Before creating a release, build the Windows installer:

```bash
npm run dist -- --win
```

This will create the installer in the `dist` folder.

## Step 5: Create a GitHub Release

1. Go to your GitHub repository
2. Click on "Releases" on the right side
3. Click "Create a new release"
4. Tag version: `v1.0.0` (or your preferred version)
5. Release title: `Resume Improver v1.0.0`
6. Description: Copy the content from your README.md file
7. Upload the Windows installer from the `dist` folder
8. Click "Publish release"

## Step 6: Update README.md

After creating the release, update the README.md file to include the correct link to your GitHub repository and releases page.

## Step 7: Push the Updated README

```bash
git add README.md
git commit -m "Update README with correct GitHub links"
git push
```

## Additional Tips

- Consider adding a CONTRIBUTING.md file if you want others to contribute to your project
- You might want to add issue templates to make it easier for users to report bugs or request features
- Consider setting up GitHub Actions for automated builds and releases in the future 