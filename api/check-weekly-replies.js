/**
 * Check for leads that replied in the past week
 */

require('dotenv').config();
const { InstantlyClient } = require('../lib/instantly');
const { getLastWeekDates } = require('../lib/dates');

async function checkWeeklyReplies() {
  try {
    const client = new InstantlyClient(process.env.BRENT_INSTANTLY_API_KEY);

    const { start, end } = getLastWeekDates();
    const weekStart = new Date(start);
    const weekEnd = new Date(end);

    console.log(`\nChecking for replies between ${start} and ${end}\n`);

    // Get all campaigns
    const campaigns = await client.getCampaigns(100);
    const activeCampaigns = campaigns.filter(c => c.status === 1);

    for (const campaign of activeCampaigns) {
      console.log(`\nCampaign: ${campaign.name}`);
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

      // Check for replies this week using timestamp_last_reply
      const repliedThisWeek = allLeads.filter(lead => {
        if (!lead.timestamp_last_reply) return false;
        const replyDate = new Date(lead.timestamp_last_reply);
        return replyDate >= weekStart && replyDate <= weekEnd;
      });

      console.log(`Leads that replied this week: ${repliedThisWeek.length}`);

      if (repliedThisWeek.length > 0) {
        console.log('\nReplies this week:\n');
        repliedThisWeek.forEach((lead, idx) => {
          console.log(`${idx + 1}. ${lead.email}`);
          console.log(`   Reply Date: ${lead.timestamp_last_reply}`);
          console.log(`   Reply Count: ${lead.email_reply_count}`);
          console.log(`   Interest Status: ${lead.interest_status || 'none'}`);
          console.log(`   Interest Label: ${lead.interest_status_label || 'none'}`);
          console.log(`   LT Interest Status: ${lead.lt_interest_status}`);
          if (lead.timestamp_last_interest_change) {
            console.log(`   Interest Changed: ${lead.timestamp_last_interest_change}`);
          }
          console.log('');
        });
      }

      // Also check for interest status changes this week
      const interestChangedThisWeek = allLeads.filter(lead => {
        if (!lead.timestamp_last_interest_change) return false;
        const changeDate = new Date(lead.timestamp_last_interest_change);
        return changeDate >= weekStart && changeDate <= weekEnd;
      });

      console.log(`Interest status changes this week: ${interestChangedThisWeek.length}`);

      if (interestChangedThisWeek.length > 0) {
        console.log('\nInterest changes this week:\n');
        interestChangedThisWeek.forEach((lead, idx) => {
          console.log(`${idx + 1}. ${lead.email}`);
          console.log(`   Interest Changed: ${lead.timestamp_last_interest_change}`);
          console.log(`   Interest Status: ${lead.interest_status || 'none'}`);
          console.log(`   Interest Label: ${lead.interest_status_label || 'none'}`);
          console.log(`   LT Interest Status: ${lead.lt_interest_status}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkWeeklyReplies();
