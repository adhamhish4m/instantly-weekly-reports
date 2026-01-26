/**
 * Get the start and end dates for the previous week (Monday to Sunday)
 */
function getLastWeekDates() {
  const now = new Date();

  // Get last Sunday
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - now.getDay());
  lastSunday.setHours(23, 59, 59, 999);

  // Get the Monday before that (7 days back from last Sunday)
  const lastMonday = new Date(lastSunday);
  lastMonday.setDate(lastSunday.getDate() - 6);
  lastMonday.setHours(0, 0, 0, 0);

  return {
    start: lastMonday.toISOString(),
    end: lastSunday.toISOString(),
  };
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

module.exports = {
  getLastWeekDates,
  formatDate,
};
