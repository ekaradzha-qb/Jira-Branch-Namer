// DOM Elements
const elements = {
  loadingState: document.getElementById('loading-state'),
  noJiraState: document.getElementById('no-jira-state'),
  formState: document.getElementById('form-state'),
  customSection: document.getElementById('custom-section'),
  customSectionHeader: document.getElementById('custom-section-header'),
  customSectionContent: document.getElementById('custom-section-content'),
  issueKey: document.getElementById('issue-key'),
  storyName: document.getElementById('story-name'),
  gitCommand: document.getElementById('git-command'),
  gitCommandGroup: document.getElementById('git-command-group'),
  branchName: document.getElementById('branch-name'),
  customInput: document.getElementById('custom-input'),
  generateBtn: document.getElementById('generate-btn'),
  customOutput: document.getElementById('custom-output'),
  customGitCommand: document.getElementById('custom-git-command'),
  customBranchName: document.getElementById('custom-branch-name'),
  copyLinkBtn: document.getElementById('copy-link-btn'),
  jiraBoardBtn: document.getElementById('jira-board-btn'),
  myStoriesBtn: document.getElementById('my-stories-btn'),
  optionsBtn: document.getElementById('options-btn'),
  quickLinksDisplay: document.getElementById('quick-links-display')
};

// Current story URL
let currentStoryUrl = '';

// Default options
let options = {
  prefixBefore: '',
  prefixAfter: '',
  replacePrefix: false,
  customPrefix: '',
  customBranchPrefix: 'GOAT-0000',
  hideGitCommand: false,
  hideCustomSection: false,
  jiraBoardUrl: '',
  jiraAssigneeId: '',
  quickLinks: []
};

/**
 * Loads options from Chrome storage
 */
async function loadOptions() {
  try {
    const result = await chrome.storage.sync.get([
      'prefixBefore',
      'prefixAfter',
      'replacePrefix',
      'customPrefix',
      'customBranchPrefix',
      'hideGitCommand',
      'hideCustomSection',
      'jiraBoardUrl',
      'jiraAssigneeId',
      'darkTheme',
      'quickLinks'
    ]);
    options.prefixBefore = result.prefixBefore || '';
    options.prefixAfter = result.prefixAfter || '';
    options.replacePrefix = result.replacePrefix || false;
    options.customPrefix = result.customPrefix || '';
    options.customBranchPrefix = result.customBranchPrefix || 'GOAT-0000';
    options.hideGitCommand = result.hideGitCommand === true;
    options.hideCustomSection = result.hideCustomSection === true;
    options.jiraBoardUrl = result.jiraBoardUrl || '';
    options.jiraAssigneeId = result.jiraAssigneeId || '';
    options.quickLinks = result.quickLinks || [];

    // Update JIRA board button if URL is configured
    if (elements.jiraBoardBtn && options.jiraBoardUrl) {
      elements.jiraBoardBtn.href = options.jiraBoardUrl;
      elements.jiraBoardBtn.classList.remove('d-none');
    }

    // Update My Stories button if both URL and assignee ID are configured
    if (elements.myStoriesBtn && options.jiraBoardUrl && options.jiraAssigneeId) {
      elements.myStoriesBtn.href = `${options.jiraBoardUrl}?assignee=${options.jiraAssigneeId}`;
      elements.myStoriesBtn.classList.remove('d-none');
    }

    // Hide Git Command field if option is enabled
    if (elements.gitCommandGroup && options.hideGitCommand) {
      elements.gitCommandGroup.style.display = 'none';
    }
  } catch (e) {
    console.log('Using default options');
  }
}

/**
 * Converts a story name to a git-compatible branch name
 * @param {string} storyName - The JIRA story name
 * @returns {string} Git-compatible branch name segment
 */
function convertToBranchName(storyName) {
  return storyName
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters (keep only alphanumeric and hyphens)
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit length
    .substring(0, 50);
}

/**
 * Creates the full branch name from issue key and story name
 * @param {string} issueKey - The JIRA issue key (kept UPPERCASE)
 * @param {string} storyName - The story name
 * @returns {string} Full branch name
 */
function createFullBranchName(issueKey, storyName) {
  const convertedName = convertToBranchName(storyName);

  let prefix;
  if (options.replacePrefix && options.customPrefix) {
    prefix = options.customPrefix;
  } else {
    prefix = `${options.prefixBefore}${issueKey.toUpperCase()}${options.prefixAfter}`;
  }

  return `${prefix}-${convertedName}`;
}

/**
 * Creates a custom branch name with the custom prefix
 * @param {string} description - The branch description
 * @returns {string} Full branch name
 */
function createCustomBranchName(description) {
  const convertedName = convertToBranchName(description);
  return `${options.customBranchPrefix}-${convertedName}`;
}

/**
 * Shows a specific state and hides others
 * @param {string} stateName - State to show: 'loading', 'no-jira', or 'form'
 */
function showState(stateName) {
  elements.loadingState.classList.toggle('d-none', stateName !== 'loading');
  elements.noJiraState.classList.toggle('d-none', stateName !== 'no-jira');
  elements.formState.classList.toggle('d-none', stateName !== 'form');

  // Show/hide custom section based on state and settings
  if (stateName === 'loading' || options.hideCustomSection === true) {
    elements.customSection.style.display = 'none';
  } else {
    elements.customSection.style.display = '';
    elements.customSection.classList.remove('d-none');
  }

  // Collapse custom section when story is detected, expand when no story
  if (stateName === 'form') {
    setCustomSectionCollapsed(true);
  } else if (stateName === 'no-jira') {
    setCustomSectionCollapsed(false);
  }
}

/**
 * Sets the collapsed state of the custom branch section
 * @param {boolean} collapsed - Whether to collapse the section
 */
function setCustomSectionCollapsed(collapsed) {
  if (collapsed) {
    elements.customSection.classList.add('collapsed');
    elements.customSectionHeader.classList.add('collapsed');
    elements.customSectionContent.classList.add('collapsed');
  } else {
    elements.customSection.classList.remove('collapsed');
    elements.customSectionHeader.classList.remove('collapsed');
    elements.customSectionContent.classList.remove('collapsed');
  }
}

/**
 * Updates the git command field based on current branch name
 */
function updateGitCommand() {
  const branchName = elements.branchName.value;
  const gitCommand = `git checkout -b ${branchName}`;
  elements.gitCommand.value = gitCommand;

  // Update custom tooltips
  const gitCommandTooltip = document.getElementById('git-command-tooltip');
  const branchNameTooltip = document.getElementById('branch-name-tooltip');
  if (gitCommandTooltip) gitCommandTooltip.textContent = gitCommand;
  if (branchNameTooltip) branchNameTooltip.textContent = branchName;

  // Update quick links with new branch name
  renderQuickLinks(branchName);
}

/**
 * Validates if a URL is valid
 * @param {string} url - The URL to validate
 * @returns {boolean} True if URL is valid
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Renders quick links with the branch name placeholder replaced
 * @param {string} branchName - The branch name to insert
 */
function renderQuickLinks(branchName) {
  if (!elements.quickLinksDisplay || !options.quickLinks || options.quickLinks.length === 0) {
    if (elements.quickLinksDisplay) {
      elements.quickLinksDisplay.classList.add('d-none');
    }
    return;
  }

  elements.quickLinksDisplay.innerHTML = '';

  options.quickLinks.forEach(link => {
    if (!link.label || !link.url) return;

    // Replace placeholder and validate URL
    const resolvedUrl = link.url.replace(/<branch>/gi, branchName);
    if (!isValidUrl(resolvedUrl)) return;

    const linkEl = document.createElement('a');
    linkEl.href = resolvedUrl;
    linkEl.target = '_blank';
    linkEl.className = 'quick-link-item';
    linkEl.innerHTML = `<span class="quick-link-label">${link.label}:</span> <span class="quick-link-text">Link</span>`;
    elements.quickLinksDisplay.appendChild(linkEl);
  });

  if (elements.quickLinksDisplay.children.length > 0) {
    elements.quickLinksDisplay.classList.remove('d-none');
  } else {
    elements.quickLinksDisplay.classList.add('d-none');
  }
}


/**
 * Shows checkmark feedback in the input field (permanent)
 * @param {HTMLInputElement} input - The input element
 */
function showCopyFeedback(input) {
  const wrapper = input.closest('.input-wrapper');
  if (wrapper) {
    wrapper.classList.add('copied');
  }
}

/**
 * Copies text to clipboard and shows feedback
 * @param {string} text - Text to copy
 * @param {HTMLButtonElement} button - The copy button
 * @param {HTMLInputElement} input - The input element
 */
async function copyToClipboard(text, button, input) {
  try {
    await navigator.clipboard.writeText(text);

    // Show checkmark in input
    showCopyFeedback(input);

    // Show feedback on button
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 1500);
  } catch (err) {
    console.error('Failed to copy:', err);
    button.textContent = 'Error';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 1500);
  }
}

/**
 * Generates custom branch name from input
 */
function generateCustomBranch() {
  const description = elements.customInput.value.trim();
  if (!description) return;

  const branchName = createCustomBranchName(description);
  const gitCommand = `git checkout -b ${branchName}`;

  elements.customBranchName.value = branchName;
  elements.customGitCommand.value = gitCommand;

  // Update custom tooltips
  const customGitCommandTooltip = document.getElementById('custom-git-command-tooltip');
  const customBranchNameTooltip = document.getElementById('custom-branch-name-tooltip');
  if (customGitCommandTooltip) customGitCommandTooltip.textContent = gitCommand;
  if (customBranchNameTooltip) customBranchNameTooltip.textContent = branchName;
  
  // Show output section
  elements.customOutput.classList.remove('d-none');

  // Reset checkmarks for new generation
  elements.customOutput.querySelectorAll('.input-wrapper').forEach(wrapper => {
    wrapper.classList.remove('copied');
  });
}

/**
 * Fetches JIRA story info from the active tab
 */
async function fetchJiraStoryInfo() {
  showState('loading');

  try {
    // Load options first
    await loadOptions();

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url?.includes('atlassian.net')) {
      showState('no-jira');
      return;
    }

    // Try to inject content script if not already present
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      });
    } catch (e) {
      // Script might already be injected, continue
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getJiraStoryInfo' });

    if (!response?.success || !response.data) {
      showState('no-jira');
      return;
    }

    populateForm(response.data);
    showState('form');

  } catch (error) {
    console.error('Error fetching JIRA info:', error);
    showState('no-jira');
  }
}

/**
 * Populates the form with story info
 * @param {Object} storyInfo - Story information
 */
function populateForm(storyInfo) {
  elements.issueKey.textContent = storyInfo.issueKey;
  elements.issueKey.href = storyInfo.url;
  elements.storyName.textContent = storyInfo.storyName;
  elements.storyName.title = storyInfo.storyName; // Tooltip for full text

  // Store URL for copy link button
  currentStoryUrl = storyInfo.url;

  const branchName = createFullBranchName(storyInfo.issueKey, storyInfo.storyName);
  elements.branchName.value = branchName;
  updateGitCommand();
}

// Event Listeners
elements.branchName.addEventListener('input', updateGitCommand);
elements.gitCommand.addEventListener('input', () => {
  const gitCommandTooltip = document.getElementById('git-command-tooltip');
  if (gitCommandTooltip) gitCommandTooltip.textContent = elements.gitCommand.value;
});

// Custom section collapse toggle
elements.customSectionHeader.addEventListener('click', () => {
  const isCollapsed = elements.customSectionHeader.classList.contains('collapsed');
  setCustomSectionCollapsed(!isCollapsed);
});

// Generate button handler
elements.generateBtn.addEventListener('click', generateCustomBranch);

// Copy link button handler
if (elements.copyLinkBtn) {
  elements.copyLinkBtn.addEventListener('click', async () => {
    if (!currentStoryUrl) return;

    try {
      await navigator.clipboard.writeText(currentStoryUrl);

      // Show feedback
      elements.copyLinkBtn.classList.add('copied');
      elements.copyLinkBtn.title = 'Copied!';

      setTimeout(() => {
        elements.copyLinkBtn.classList.remove('copied');
        elements.copyLinkBtn.title = 'Copy link';
      }, 1500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  });
}

// Options button handler
if (elements.optionsBtn) {
  elements.optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Enter key in custom input
elements.customInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    generateCustomBranch();
  }
});

// Copy button handlers
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) {
      copyToClipboard(input.value, btn, input);
    }
  });
});

// Theme toggle handler
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  // Set initial state from chrome.storage and sync to localStorage
  chrome.storage.sync.get(['darkTheme']).then(result => {
    const isDark = result.darkTheme || false;
    themeToggle.checked = isDark;
    // Sync localStorage cache with chrome.storage
    localStorage.setItem('darkTheme', isDark.toString());
    // Ensure body also has the class
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('dark-theme', isDark);
  });

  // Handle toggle change
  themeToggle.addEventListener('change', async () => {
    const isDark = themeToggle.checked;
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('dark-theme', isDark);
    // Save to both localStorage (for instant sync) and chrome.storage (for persistence)
    localStorage.setItem('darkTheme', isDark.toString());
    await chrome.storage.sync.set({ darkTheme: isDark });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchJiraStoryInfo);
