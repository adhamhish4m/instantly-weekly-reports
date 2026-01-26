/**
 * Test script to manually trigger reports
 * Usage:
 *   node api/test-report.js phil
 *   node api/test-report.js brent
 *   node api/test-report.js darrell
 */

require('dotenv').config();
const { InstantlyClient, calculateWeeklyMetrics } = require('../lib/instantly');
const { sendSlackReport } = require('../lib/slack');
const { getLastWeekDates } = require('../lib/dates');

const clients = {
  phil: {
    name: 'Phil',
    apiKey: process.env.PHIL_INSTANTLY_API_KEY,
    slackWebhook: process.env.PHIL_SLACK_WEBHOOK,
  },
  brent: {
    name: 'Brent',
    apiKey: process.env.BRENT_INSTANTLY_API_KEY,
    slackWebhook: process.env.BRENT_SLACK_WEBHOOK,
  },
  darrell: {
    name: 'Darrell',
    apiKey: process.env.DARRELL_INSTANTLY_API_KEY,
    slackWebhook: process.env.DARRELL_SLACK_WEBHOOK,
  },
  testclient5: {
    name: 'Testclient5',
    apiKey: process.env.TESTCLIENT5_INSTANTLY_API_KEY,
    slackChannelId: process.env.TESTCLIENT5_SLACK_CHANNEL_ID,
  },
  testclient4: {
    name: 'Testclient4',
    apiKey: process.env.TESTCLIENT4_INSTANTLY_API_KEY,
    slackChannelId: process.env.TESTCLIENT4_SLACK_CHANNEL_ID,
  },
  testclient3: {
    name: 'Testclient3',
    apiKey: process.env.TESTCLIENT3_INSTANTLY_API_KEY,
    slackChannelId: process.env.TESTCLIENT3_SLACK_CHANNEL_ID,
  },
  testclient2: {
    name: 'Testclient2',
    apiKey: process.env.TESTCLIENT2_INSTANTLY_API_KEY,
    slackChannelId: process.env.TESTCLIENT2_SLACK_CHANNEL_ID,
  },
  testclient: {
    name: 'Testclient',
    apiKey: process.env.TESTCLIENT_INSTANTLY_API_KEY,
    slackChannelId: process.env.TESTCLIENT_SLACK_CHANNEL_ID,
  },
  test: {
    name: 'Test',
    apiKey: process.env.TEST_INSTANTLY_API_KEY,
    slackChannelId: process.env.TEST_SLACK_CHANNEL_ID,
  },
  sarah: {
    name: 'Sarah',
    apiKey: process.env.SARAH_INSTANTLY_API_KEY,
    slackChannelId: process.env.SARAH_SLACK_CHANNEL_ID,
  },
};

async function testReport(clientKey) {
  try {
    const config = clients[clientKey];

    if (!config) {
      console.error(`Unknown client: ${clientKey}`);
      console.log('Available clients: phil, brent, darrell');
      process.exit(1);
    }

    console.log(`\nTesting report for ${config.name}...`);
    console.log('='.repeat(50));

    // Validate environment variables
    if (!config.apiKey || !config.slackWebhook) {
      throw new Error(`Missing environment variables for ${config.name}`);
    }

    // Get last week's date range
    const { start, end } = getLastWeekDates();
    console.log(`\nWeek Range: ${start} to ${end}\n`);

    // Initialize Instantly client
    const client = new InstantlyClient(config.apiKey);

    // Calculate metrics
    console.log('Fetching campaign data...');
    const metrics = await calculateWeeklyMetrics(client, start, end);

    console.log('\nMetrics:');
    console.log(`  Total Reached Out: ${metrics.totalReachedOut}`);
    console.log(`  New Leads: ${metrics.totalNewLeads}`);
    console.log(`  Interested Leads: ${metrics.totalInterestedLeads}`);
    console.log(`  Active Campaigns: ${metrics.totalCampaigns}`);

    if (metrics.campaignDetails && metrics.campaignDetails.length > 0) {
      console.log('\nCampaign Breakdown:');
      metrics.campaignDetails.forEach(campaign => {
        console.log(`  ${campaign.name}:`);
        console.log(`    - Reached Out: ${campaign.reachedOut}`);
        console.log(`    - New Leads: ${campaign.newLeads}`);
        console.log(`    - Interested: ${campaign.interested}`);
      });
    }

    // Only send to Slack if there was activity this week
    if (metrics.totalReachedOut === 0 && metrics.totalInterestedLeads === 0) {
      console.log('\n⏭️  No activity this week - skipping Slack notification');
      console.log('✅ Report completed (no notification sent)\n');
      return;
    }

    // Send to Slack
    console.log('\nSending to Slack...');
    await sendSlackReport(
      config.slackWebhook,
      config.name,
      metrics,
      start,
      end
    );

    console.log('✅ Report sent successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Get client from command line argument
const clientKey = process.argv[2];

if (!clientKey) {
  console.log('Usage: node api/test-report.js [client]');
  console.log('Clients: phil, brent, darrell');
  process.exit(1);
}

testReport(clientKey.toLowerCase());
