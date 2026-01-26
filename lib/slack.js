const fetch = require('node-fetch');

/**
 * Send a formatted report to Slack
 */
async function sendSlackReport(webhookUrl, clientName, metrics, weekStart, weekEnd) {
  const startDate = new Date(weekStart).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const endDate = new Date(weekEnd).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Build campaign breakdown
  let campaignBreakdown = '';
  if (metrics.campaignDetails && metrics.campaignDetails.length > 0) {
    campaignBreakdown = '\n\n*Campaign Breakdown:*\n';
    metrics.campaignDetails.forEach(campaign => {
      campaignBreakdown += `\n*${campaign.name}*\n`;
      campaignBreakdown += `  • Reached Out: ${campaign.reachedOut}\n`;
      campaignBreakdown += `  • New Leads: ${campaign.newLeads}\n`;
      campaignBreakdown += `  • Interested: ${campaign.interested}\n`;
    });
  }

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📊 Weekly Campaign Report - ${clientName}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Week of ${startDate} - ${endDate}*`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*📧 Leads Reached Out To*\n${metrics.totalReachedOut}`
          },
          {
            type: 'mrkdwn',
            text: `*✨ New Leads*\n${metrics.totalNewLeads}`
          },
          {
            type: 'mrkdwn',
            text: `*🎯 Interested Leads*\n${metrics.totalInterestedLeads}`
          },
          {
            type: 'mrkdwn',
            text: `*🚀 Active Campaigns*\n${metrics.totalCampaigns}`
          }
        ]
      }
    ]
  };

  // Add campaign breakdown as a context block if available
  if (campaignBreakdown) {
    message.blocks.push({
      type: 'divider'
    });
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: campaignBreakdown
      }
    });
  }

  // Add footer
  message.blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Generated on ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        })}`
      }
    ]
  });

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook error: ${response.status} ${response.statusText}`);
  }

  return { success: true };
}

module.exports = {
  sendSlackReport,
};
