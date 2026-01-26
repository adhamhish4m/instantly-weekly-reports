# Instantly Campaign Reporter

Automated weekly reporting system that sends Instantly.ai campaign performance metrics to Slack channels.

## Features

- **Automated Weekly Reports**: Runs every Sunday at 9am in each client's timezone
- **Multi-Client Support**: Separate reports for Phil, Brent, and Darrell
- **Key Metrics Tracked**:
  - Total leads reached out to (unique contacts)
  - New leads (first contacts made that week)
  - Interested leads (positive replies)
  - Active campaigns count
  - Per-campaign breakdown

## Schedule

- **Phil** (Dubai, UTC+4): Sunday 9:00 AM → Cron: `0 5 * * 0` (Sunday 5:00 UTC)
- **Darrell** (Oklahoma, CST): Sunday 9:00 AM → Cron: `0 15 * * 0` (Sunday 15:00 UTC)
- **Brent** (California, PST): Sunday 9:00 AM → Cron: `0 17 * * 0` (Sunday 17:00 UTC)

## Important Notes

- **Instantly API V2**: This automation uses Instantly.ai API V2 endpoints
- **API Keys**: Make sure your API keys are V2 keys (get them from Instantly Dashboard → Settings → Integrations → API)
- **Campaign Status**: Only campaigns with status = 1 (active) are tracked
- **Interested Leads**: Unique count based on `lt_interest_status === 1` (positive interest). If a lead appears in multiple campaigns, they're only counted once in the total.
- **Weekly Period**: Reports cover Monday-Sunday of the previous week

## Deployment Instructions

### 1. Test Locally (Optional but Recommended)

Install dependencies:

```bash
npm install
```

Create a `.env` file for local testing:

```bash
cp .env.example .env
```

Test each client's report:

```bash
node api/test-report.js phil
node api/test-report.js brent
node api/test-report.js darrell
```

This will fetch real data and send a test report to the respective Slack channel.

### 2. Create GitHub Repository

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Instantly campaign reporter"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `instantly-campaign-reporter` (or whatever you prefer)
   - Make it **Private** (to keep your API keys secure)
   - Don't initialize with README (you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/instantly-campaign-reporter.git
   git branch -M main
   git push -u origin main
   ```

### 3. Add GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add all 6 secrets:
   - `PHIL_INSTANTLY_API_KEY`
   - `PHIL_SLACK_WEBHOOK`
   - `BRENT_INSTANTLY_API_KEY`
   - `BRENT_SLACK_WEBHOOK`
   - `DARRELL_INSTANTLY_API_KEY`
   - `DARRELL_SLACK_WEBHOOK`

### 4. Enable GitHub Actions

GitHub Actions are automatically enabled! The workflows in `.github/workflows/` will run:
- **Phil**: Every Sunday at 9:00 AM Dubai time
- **Brent**: Every Sunday at 9:00 AM PST
- **Darrell**: Every Sunday at 9:00 AM CST

### 5. Manual Trigger (Optional)

You can manually trigger any report:
1. Go to **Actions** tab in your GitHub repo
2. Select the workflow (e.g., "Phil Weekly Report")
3. Click **Run workflow** → **Run workflow**

## GitHub Actions (Free!)

The automation uses GitHub Actions workflows (completely free):

- **Phil's Report**: `.github/workflows/phil-report.yml` - Runs at 5:00 UTC
- **Brent's Report**: `.github/workflows/brent-report.yml` - Runs at 17:00 UTC
- **Darrell's Report**: `.github/workflows/darrell-report.yml` - Runs at 15:00 UTC

**GitHub Free Tier Includes**:
- 2,000 minutes/month of Actions (plenty for weekly reports)
- Unlimited private repositories
- Built-in scheduling with cron syntax

## Project Structure

```
.
├── .github/
│   └── workflows/
│       ├── phil-report.yml     # Phil's weekly schedule
│       ├── brent-report.yml    # Brent's weekly schedule
│       └── darrell-report.yml  # Darrell's weekly schedule
├── api/
│   ├── test-report.js          # Main report script (used by workflows)
│   └── debug-*.js              # Debug/testing scripts
├── lib/
│   ├── instantly.js            # Instantly.ai API client
│   ├── slack.js                # Slack messaging functions
│   └── dates.js                # Date utility functions
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
└── README.md                   # This file
```

## Troubleshooting

### Check GitHub Actions Logs

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select the workflow run to view logs
4. Check for any error messages

### Test Locally

```bash
# Test a specific client
node api/test-report.js phil
node api/test-report.js brent
node api/test-report.js darrell
```

### Common Issues

1. **"Missing environment variables"**: Ensure all 6 secrets are added in GitHub Settings → Secrets and variables → Actions
2. **Workflow not running**: Check the **Actions** tab to verify workflows are enabled
3. **Slack webhook errors**: Check that webhook URLs are correct and haven't expired
4. **Instantly API errors**: Verify API keys are correct and have proper permissions
5. **Workflow syntax errors**: Validate YAML syntax in `.github/workflows/*.yml` files

## Monitoring

- Check Slack channels every Sunday to confirm reports are arriving
- View execution logs in GitHub Actions tab
- Set up GitHub notifications for workflow failures (Settings → Notifications)
- Each workflow can be manually triggered for testing

## Updating Client Information

To add/remove clients or update credentials:

1. Update GitHub Secrets (Settings → Secrets and variables → Actions)
2. Create/modify workflow files in `.github/workflows/` directory
3. Commit and push changes to GitHub

To add a new client:
1. Add their API key and Slack webhook as GitHub Secrets
2. Create a new workflow file (copy existing one and update schedule/env vars)
3. Commit and push

## Support

For issues with:
- **Instantly.ai API**: Check [Instantly API docs](https://developer.instantly.ai/)
- **Slack Webhooks**: Check [Slack API docs](https://api.slack.com/messaging/webhooks)
- **GitHub Actions**: Check [GitHub Actions docs](https://docs.github.com/en/actions)
