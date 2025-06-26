// content.js
// This script will interact with the Google Chat input box.
// Implementation will be added later.

// Helper to find the Google Chat message input box
function getChatInputBox() {
  const input = document.querySelector('textarea[aria-label="Message"]');
  console.log('[Extension] Located chat input box:', input);
  return input;
}

// Listen for messages from the background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Extension] Content script received message:', request);
  if (request.action === 'getMessage') {
    const input = getChatInputBox();
    const value = input ? input.value : '';
    console.log('[Extension] Returning chat input value:', value);
    sendResponse({ message: value });
  } else if (request.action === 'setMessage') {
    const input = getChatInputBox();
    if (input) {
      input.value = request.message;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[Extension] Set chat input value to:', request.message);
      sendResponse({ success: true });
    } else {
      console.warn('[Extension] Could not find chat input box to set message.');
      sendResponse({ success: false });
    }
  }
  return true;
});
