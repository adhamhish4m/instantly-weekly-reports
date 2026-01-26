# Quick Deployment Guide

## Setup Steps (5 minutes)

### 1. Create GitHub Repository

```bash
cd /Users/adham/Desktop/processes

# Initialize git
git init
git add .
git commit -m "Initial commit: Instantly campaign reporter"
```

Go to [github.com/new](https://github.com/new) and create a **private** repository named `instantly-campaign-reporter`

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/instantly-campaign-reporter.git
git branch -M main
git push -u origin main
```

### 2. Add GitHub Secrets

1. Go to your repository: `https://github.com/YOUR_USERNAME/instantly-campaign-reporter`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these 6 secrets

**Get the actual values from `CREDENTIALS.txt` file (not committed to git)**

| Secret Name | Description |
|-------------|-------------|
| `PHIL_INSTANTLY_API_KEY` | Phil's Instantly API key |
| `PHIL_SLACK_WEBHOOK` | Phil's Slack webhook URL |
| `BRENT_INSTANTLY_API_KEY` | Brent's Instantly API key |
| `BRENT_SLACK_WEBHOOK` | Brent's Slack webhook URL |
| `DARRELL_INSTANTLY_API_KEY` | Darrell's Instantly API key |
| `DARRELL_SLACK_WEBHOOK` | Darrell's Slack webhook URL |

### 3. Done! 🎉

That's it! The automation will now run automatically every Sunday at 9am for each client.

## Testing

### Manual Trigger

1. Go to **Actions** tab in your GitHub repo
2. Select a workflow (e.g., "Phil Weekly Report")
3. Click **Run workflow** → **Run workflow**

### Local Testing

```bash
npm install
cp CREDENTIALS.txt .env  # Use real credentials for local testing
node api/test-report.js phil
node api/test-report.js brent
node api/test-report.js darrell
```

## Schedule

- **Phil** (Dubai): Sunday 9:00 AM Dubai time (5:00 UTC)
- **Darrell** (Oklahoma): Sunday 9:00 AM CST (15:00 UTC)
- **Brent** (California): Sunday 9:00 AM PST (17:00 UTC)

## Monitoring

Check the **Actions** tab in GitHub to see workflow runs and logs.

## Cost

**$0/month** - Completely free with GitHub Actions free tier!
