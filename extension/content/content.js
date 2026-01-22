// Content script for extracting JIRA story information

/**
 * Extracts JIRA story information from the current page
 * @returns {Object|null} Story info or null if not on a story page
 */
function extractJiraStoryInfo() {
  // Extract story name from the summary heading
  const summaryElement = document.querySelector(
    '[data-testid="issue.views.issue-base.foundation.summary.heading"]'
  );

  // Extract issue key from breadcrumb
  const issueKeyElement = document.querySelector(
    '[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]'
  );

  if (!summaryElement || !issueKeyElement) {
    return null;
  }

  const storyName = summaryElement.textContent?.trim();
  const issueKey = issueKeyElement.textContent?.trim();

  if (!storyName || !issueKey) {
    return null;
  }

  return {
    storyName,
    issueKey,
    url: window.location.href
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJiraStoryInfo') {
    const storyInfo = extractJiraStoryInfo();
    sendResponse({ success: !!storyInfo, data: storyInfo });
  }
  return true; // Keep channel open for async response
});
