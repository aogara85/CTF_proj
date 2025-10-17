// Common utility functions for the CTF challenge

// API helper function
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} show`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '1000';
  notification.style.minWidth = '300px';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Format JSON for display
function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

// Copy to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showNotification('Copied to clipboard!', 'success');
  } catch (err) {
    showNotification('Failed to copy', 'error');
  }
  
  document.body.removeChild(textarea);
}

// Validate JSON
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Console logger for debugging
const ctfLogger = {
  log: (message, data) => {
    console.log(`[CTF] ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`[CTF ERROR] ${message}`, error || '');
  },
  success: (message) => {
    console.log(`%c[CTF SUCCESS] ${message}`, 'color: green; font-weight: bold');
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    apiRequest,
    showNotification,
    formatJSON,
    copyToClipboard,
    isValidJSON,
    ctfLogger
  };
}
