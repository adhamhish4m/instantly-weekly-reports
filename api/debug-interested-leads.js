/**
 * Debug script to examine interested leads and their timestamps
 * Usage: node api/debug-interested-leads.js brent
 */

require('dotenv').config();
const { InstantlyClient } = require('../lib/instantly');
const { getLastWeekDates } = require('../lib/dates');

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

async function debugInterestedLeads(clientKey) {
  try {
    const config = clients[clientKey];

    if (!config) {
      console.error(`Unknown client: ${clientKey}`);
      console.log('Available clients: phil, brent, darrell');
      process.exit(1);
    }

    console.log(`\nDebug interested leads for ${config.name}...`);
    console.log('='.repeat(50));

    const client = new InstantlyClient(config.apiKey);

    // Get all campaigns
    const campaigns = await client.getCampaigns(100);
    const activeCampaigns = campaigns.filter(c => c.status === 1);

    console.log(`\nFound ${activeCampaigns.length} active campaigns\n`);

    const { start, end } = getLastWeekDates();
    const weekStart = new Date(start);
    const weekEnd = new Date(end);

    console.log(`Week Range: ${start} to ${end}\n`);

    for (const campaign of activeCampaigns) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Campaign: ${campaign.name}`);
      console.log('='.repeat(60));

      // Get all leads
      let allLeads = [];
      let startingAfter = null;
      let hasMore = true;

      while (hasMore) {
        const leadsResponse = await client.getLeads(campaign.id, 100, startingAfter);
        const leads = leadsResponse.items || [];
        allLeads = allLeads.concat(leads);

        if (leadsResponse.next_starting_after && leads.length === 100) {
          startingAfter = leadsResponse.next_starting_after;
        } else {
          hasMore = false;
        }
      }

      console.log(`Total leads: ${allLeads.length}`);

      // Find leads with any interest status set
      const interestedLeads = allLeads.filter(lead => {
        return (
          lead.interest_status === 1 ||
          lead.interest_status_label === 'positive' ||
          lead.interest_status_label === 'interested' ||
          lead.interest_status_label === 'meeting booked' ||
          lead.interest_status_label === 'Interested' ||
          lead.email_reply_count > 0
        );
      });

      console.log(`Leads with interest markers: ${interestedLeads.length}\n`);

      if (interestedLeads.length > 0) {
        console.log('Interested leads details:\n');
        interestedLeads.forEach((lead, index) => {
          console.log(`${index + 1}. ${lead.email}`);
          console.log(`   Interest Status: ${lead.interest_status}`);
          console.log(`   Interest Label: ${lead.interest_status_label || 'none'}`);
          console.log(`   Reply Count: ${lead.email_reply_count}`);
          console.log(`   Created: ${lead.timestamp_created}`);
          console.log(`   Updated: ${lead.timestamp_updated}`);
          console.log(`   Last Contact: ${lead.timestamp_last_contact || 'none'}`);
          console.log(`   Last Touch: ${lead.timestamp_last_touch || 'none'}`);

          // Check if updated in the week
          const updatedDate = new Date(lead.timestamp_updated);
          const inWeek = updatedDate >= weekStart && updatedDate <= weekEnd;
          console.log(`   Updated this week: ${inWeek}`);
          console.log('');

          // Show full lead object for first interested lead
          if (index === 0) {
            console.log('   Full lead object:');
            console.log(JSON.stringify(lead, null, 2));
            console.log('');
          }
        });
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
  console.log('Usage: node api/debug-interested-leads.js [client]');
  console.log('Clients: phil, brent, darrell');
  process.exit(1);
}

debugInterestedLeads(clientKey.toLowerCase());
