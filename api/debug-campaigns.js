/**
 * Debug script to see what campaigns exist and their statuses
 * Usage: node api/debug-campaigns.js phil
 */

require('dotenv').config();
const { InstantlyClient } = require('../lib/instantly');

const clients = {
  phil: {
    name: 'Phil',
    apiKey: process.env.PHIL_INSTANTLY_API_KEY,
  },
  brent: {
    name: 'Brent',
    apiKey: process.env.BRENT_INSTANTLY_API_KEY,
  },
  darrell: {
    name: 'Darrell',
    apiKey: process.env.DARRELL_INSTANTLY_API_KEY,
  },
};

async function debugCampaigns(clientKey) {
  try {
    const config = clients[clientKey];

    if (!config) {
      console.error(`Unknown client: ${clientKey}`);
      console.log('Available clients: phil, brent, darrell');
      process.exit(1);
    }

    console.log(`\nDebug campaigns for ${config.name}...`);
    console.log('='.repeat(50));

    if (!config.apiKey) {
      throw new Error(`Missing API key for ${config.name}`);
    }

    const client = new InstantlyClient(config.apiKey);

    // Get all campaigns without status filter
    console.log('\nFetching all campaigns...');

    // Make raw API call to see the actual response
    const rawResponse = await client.makeRequest('/campaigns?limit=100');
    console.log('\nRaw API Response (truncated):');
    console.log(`Found ${rawResponse.items?.length || 0} campaigns`);

    const campaigns = rawResponse.items || [];

    console.log(`\nTotal campaigns found: ${campaigns.length}\n`);

    if (campaigns.length === 0) {
      console.log('No campaigns found in this account.');
      return;
    }

    // Display campaign details
    campaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status} (${typeof campaign.status})`);
      if (campaign.created_at) {
        console.log(`   Created: ${new Date(campaign.created_at).toLocaleDateString()}`);
      }
      console.log('');
    });

    // Try to get leads for the first active campaign
    if (campaigns.length > 0) {
      const activeCampaign = campaigns.find(c => c.status === 1) || campaigns[0];
      console.log(`\nFetching leads for "${activeCampaign.name}"...`);
      try {
        const leadsResponse = await client.makeRequest('/leads/list', 'POST', {
          campaign_id: activeCampaign.id,
          limit: 5
        });
        console.log('\nLeads API Response:');
        console.log(JSON.stringify(leadsResponse, null, 2).substring(0, 2000));

        const leadCount = leadsResponse.items?.length || leadsResponse.data?.length || 0;
        console.log(`\nFound ${leadCount} leads (showing first 5)`);

        const leads = leadsResponse.items || leadsResponse.data || [];
        if (leads.length > 0) {
          console.log('\nSample lead structure:');
          const sampleLead = leads[0];
          console.log('Available fields:', Object.keys(sampleLead).join(', '));
        }
      } catch (err) {
        console.error(`Error fetching leads: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

const clientKey = process.argv[2];

if (!clientKey) {
  console.log('Usage: node api/debug-campaigns.js [client]');
  console.log('Clients: phil, brent, darrell');
  process.exit(1);
}

debugCampaigns(clientKey.toLowerCase());
