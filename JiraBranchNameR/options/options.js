// DOM Elements
const prefixBeforeInput = document.getElementById('prefix-before');
const prefixAfterInput = document.getElementById('prefix-after');
const replacePrefixCheckbox = document.getElementById('replace-prefix');
const customPrefixInput = document.getElementById('custom-prefix');
const customBranchPrefixInput = document.getElementById('custom-branch-prefix');
const hideGitCommandCheckbox = document.getElementById('hide-git-command');
const hideCustomSectionCheckbox = document.getElementById('hide-custom-section');
const jiraBoardUrlInput = document.getElementById('jira-board-url');
const jiraAssigneeIdInput = document.getElementById('jira-assignee-id');
const replaceFields = document.getElementById('replace-fields');
const additionFields = document.getElementById('addition-fields');
const previewEl = document.getElementById('preview');
const customPreviewEl = document.getElementById('custom-preview');
const savedMessage = document.getElementById('saved-message');
const form = document.getElementById('options-form');
const quickLinksContainer = document.getElementById('quick-links-container');
const addQuickLinkBtn = document.getElementById('add-quick-link-btn');

// Quick links array
let quickLinks = [];

/**
 * Updates field visibility based on replace checkbox
 */
function updateFieldVisibility() {
  const isReplacing = replacePrefixCheckbox.checked;
  replaceFields.classList.toggle('disabled', !isReplacing);
  additionFields.classList.toggle('disabled', isReplacing);
}

/**
 * Updates the preview with current values
 */
function updatePreview() {
  const isReplacing = replacePrefixCheckbox.checked;

  let prefix;
  if (isReplacing && customPrefixInput.value) {
    prefix = customPrefixInput.value;
  } else if (isReplacing) {
    prefix = 'custom-prefix';
  } else {
    const before = prefixBeforeInput.value;
    const after = prefixAfterInput.value;
    prefix = `${before}GOAT-8074${after}`;
  }

  previewEl.textContent = `${prefix}-example-branch-name`;
}

/**
 * Updates the custom branch preview
 */
function updateCustomPreview() {
  const customPrefix = customBranchPrefixInput.value || 'GOAT-0000';
  customPreviewEl.textContent = `${customPrefix}-example-branch-name`;
}

/**
 * Creates a quick link row element
 * @param {Object} link - Link object with label and url
 * @param {number} index - Index of the link
 * @returns {HTMLElement} The quick link row element
 */
function createQuickLinkRow(link = { label: '', url: '' }, index) {
  const row = document.createElement('div');
  row.className = 'quick-link-item';
  row.dataset.index = index;

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'form-control';
  labelInput.placeholder = 'Label';
  labelInput.value = link.label;
  labelInput.addEventListener('input', () => updateQuickLinksFromUI());

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.className = 'form-control';
  urlInput.placeholder = 'URL with <branch>';
  urlInput.value = link.url;
  urlInput.addEventListener('input', () => updateQuickLinksFromUI());

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-link-btn';
  removeBtn.innerHTML = '&times;';
  removeBtn.title = 'Remove link';
  removeBtn.addEventListener('click', () => {
    row.remove();
    updateQuickLinksFromUI();
  });

  row.appendChild(labelInput);
  row.appendChild(urlInput);
  row.appendChild(removeBtn);

  return row;
}

/**
 * Renders quick links from the array
 */
function renderQuickLinks() {
  quickLinksContainer.innerHTML = '';
  quickLinks.forEach((link, index) => {
    quickLinksContainer.appendChild(createQuickLinkRow(link, index));
  });
}

/**
 * Updates the quickLinks array from UI elements
 */
function updateQuickLinksFromUI() {
  quickLinks = [];
  const rows = quickLinksContainer.querySelectorAll('.quick-link-item');
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const label = inputs[0].value.trim();
    const url = inputs[1].value.trim();
    if (label || url) {
      quickLinks.push({ label, url });
    }
  });
}

/**
 * Adds a new quick link row
 */
function addQuickLink() {
  const index = quickLinksContainer.children.length;
  quickLinksContainer.appendChild(createQuickLinkRow({ label: '', url: '' }, index));
}

/**
 * Loads saved options from Chrome storage
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
    prefixBeforeInput.value = result.prefixBefore || '';
    prefixAfterInput.value = result.prefixAfter || '';
    replacePrefixCheckbox.checked = result.replacePrefix || false;
    customPrefixInput.value = result.customPrefix || '';
    customBranchPrefixInput.value = result.customBranchPrefix || 'GOAT-0000';
    hideGitCommandCheckbox.checked = result.hideGitCommand || false;
    hideCustomSectionCheckbox.checked = result.hideCustomSection || false;
    jiraBoardUrlInput.value = result.jiraBoardUrl || '';
    jiraAssigneeIdInput.value = result.jiraAssigneeId || '';

    // Load quick links
    quickLinks = result.quickLinks || [];
    renderQuickLinks();

    updateFieldVisibility();
    updatePreview();
    updateCustomPreview();
    // Apply dark theme and sync localStorage cache
    const isDark = result.darkTheme || false;
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('darkTheme', isDark.toString());

    // Set theme toggle state
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.checked = isDark;
    }
  } catch (e) {
    console.error('Error loading options:', e);
  }
}

/**
 * Saves options to Chrome storage
 */
async function saveOptions(e) {
  e.preventDefault();

  // Update quickLinks from UI before saving
  updateQuickLinksFromUI();

  try {
    await chrome.storage.sync.set({
      prefixBefore: prefixBeforeInput.value,
      prefixAfter: prefixAfterInput.value,
      replacePrefix: replacePrefixCheckbox.checked,
      customPrefix: customPrefixInput.value,
      customBranchPrefix: customBranchPrefixInput.value || 'GOAT-0000',
      hideGitCommand: hideGitCommandCheckbox.checked,
      hideCustomSection: hideCustomSectionCheckbox.checked,
      jiraBoardUrl: jiraBoardUrlInput.value,
      jiraAssigneeId: jiraAssigneeIdInput.value,
      quickLinks: quickLinks
    });

    // Show saved message
    savedMessage.classList.add('show');
    setTimeout(() => {
      savedMessage.classList.remove('show');
    }, 2000);
  } catch (e) {
    console.error('Error saving options:', e);
  }
}

// Event Listeners
prefixBeforeInput.addEventListener('input', updatePreview);
prefixAfterInput.addEventListener('input', updatePreview);
customPrefixInput.addEventListener('input', updatePreview);
customBranchPrefixInput.addEventListener('input', updateCustomPreview);
replacePrefixCheckbox.addEventListener('change', () => {
  updateFieldVisibility();
  updatePreview();
});
form.addEventListener('submit', saveOptions);
addQuickLinkBtn.addEventListener('click', addQuickLink);

// Theme toggle handler
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
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
document.addEventListener('DOMContentLoaded', loadOptions);
