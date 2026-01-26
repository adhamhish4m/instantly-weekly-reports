const fetch = require('node-fetch');

/**
 * Instantly.ai API Client
 */
class InstantlyClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.instantly.ai/api/v2';
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Instantly API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get all campaigns (API v2)
   */
  async getCampaigns(limit = 100, status = null) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) {
      params.append('status', status);
    }
    const response = await this.makeRequest(`/campaigns?${params}`);
    return response.items || [];
  }

  /**
   * Get campaign analytics for a specific date range (API v2)
   */
  async getCampaignAnalytics(campaignId, startDate, endDate) {
    const params = new URLSearchParams({
      id: campaignId,
      start_date: startDate,
      end_date: endDate,
    });
    return await this.makeRequest(`/campaigns/analytics/overview?${params}`);
  }

  /**
   * Get leads for a campaign (API v2 - uses POST)
   */
  async getLeads(campaignId, limit = 100, startingAfter = null) {
    const body = {
      campaign_id: campaignId,
      limit: limit,
    };

    if (startingAfter) {
      body.starting_after = startingAfter;
    }

    return await this.makeRequest('/leads/list', 'POST', body);
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(campaignId) {
    const params = new URLSearchParams({ id: campaignId });
    return await this.makeRequest(`/campaigns?${params}`);
  }
}

/**
 * Calculate weekly metrics for a campaign
 */
async function calculateWeeklyMetrics(client, weekStartDate, weekEndDate) {
  try {
    // Get all campaigns (API v2 returns array directly)
    const campaigns = await client.getCampaigns(100);

    // Filter only running/active campaigns (status: 1 = active)
    const runningCampaigns = campaigns.filter(c =>
      c.status === 1 || c.status === 'active' || c.status === 'running'
    );

    console.log(`Found ${runningCampaigns.length} active campaigns`);

    let totalReachedOut = 0;
    let totalNewLeads = 0;
    const uniqueInterestedLeads = new Set(); // Track unique interested leads by email
    const campaignDetails = [];

    // Date range for filtering
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekEndDate);

    for (const campaign of runningCampaigns) {
      try {
        console.log(`Processing campaign: ${campaign.name}`);

        // Get leads to analyze (API v2 uses cursor-based pagination)
        let allLeads = [];
        let startingAfter = null;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const leadsResponse = await client.getLeads(campaign.id, limit, startingAfter);
          const leads = leadsResponse.items || [];
          allLeads = allLeads.concat(leads);

          // Check if there are more pages
          if (leadsResponse.next_starting_after && leads.length === limit) {
            startingAfter = leadsResponse.next_starting_after;
          } else {
            hasMore = false;
          }
        }

        console.log(`  Found ${allLeads.length} total leads`);

        // Count unique contacts reached out to this week (first email sent this week)
        const reachedOutThisWeek = allLeads.filter(lead => {
          if (!lead.timestamp_last_contact) return false;
          const contactDate = new Date(lead.timestamp_last_contact);
          return contactDate >= weekStart && contactDate <= weekEnd;
        });

        // New leads = first contact made this week (same as reached out)
        const newLeads = reachedOutThisWeek.length;

        // Interested leads = leads with positive interest status that had activity this week
        // Using timestamp_last_interest_change to determine when interest was marked
        const interestedLeads = allLeads.filter(lead => {
          // Check if interest status changed this week or if they replied this week
          let activityThisWeek = false;

          if (lead.timestamp_last_interest_change) {
            const interestDate = new Date(lead.timestamp_last_interest_change);
            activityThisWeek = interestDate >= weekStart && interestDate <= weekEnd;
          } else if (lead.timestamp_last_reply) {
            const replyDate = new Date(lead.timestamp_last_reply);
            activityThisWeek = replyDate >= weekStart && replyDate <= weekEnd;
          }

          if (!activityThisWeek) return false;

          // Check for positive interest indicators
          // lt_interest_status: 1 = interested/positive, 0 = neutral, -1 = not interested
          const isPositive =
            lead.lt_interest_status === 1 ||
            lead.interest_status === 1 ||
            lead.interest_status_label === 'positive' ||
            lead.interest_status_label === 'interested' ||
            lead.interest_status_label === 'meeting booked' ||
            lead.interest_status_label === 'Interested';

          return isPositive;
        });

        // Add interested leads to the unique set
        interestedLeads.forEach(lead => {
          if (lead.email) {
            uniqueInterestedLeads.add(lead.email.toLowerCase());
          }
        });

        const campaignMetrics = {
          name: campaign.name,
          reachedOut: reachedOutThisWeek.length,
          newLeads: newLeads,
          interested: interestedLeads.length,
        };

        console.log(`  Metrics: ${newLeads} new, ${interestedLeads.length} interested`);

        totalReachedOut += campaignMetrics.reachedOut;
        totalNewLeads += campaignMetrics.newLeads;

        if (campaignMetrics.reachedOut > 0 || campaignMetrics.interested > 0) {
          campaignDetails.push(campaignMetrics);
        }
      } catch (err) {
        console.error(`Error processing campaign ${campaign.id}:`, err.message);
      }
    }

    return {
      totalReachedOut,
      totalNewLeads,
      totalInterestedLeads: uniqueInterestedLeads.size,
      campaignDetails,
      totalCampaigns: runningCampaigns.length,
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
}

module.exports = {
  InstantlyClient,
  calculateWeeklyMetrics,
};
