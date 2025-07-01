// background.js
// Handles extension button click and messaging with content script.

// Define a separate prompt variable for prompting
const promptTemplate = (userMessage) => `Please rephrase and enhance the following message for better grammar and clarity:\n${userMessage}`;

// Function to call LLM API (Google Flash 2.0 or similar)
async function enhanceMessageWithLLM(message) {
  // Replace with your actual API endpoint and key
  const apiUrl = 'https://api.example.com/llm/flash2.0';
  const apiKey = 'AIzaSyAooUE1Ewp_mZ2XkUmwBp5uXbIgkLTkOys';

  // Use the prompt template
  const prompt = promptTemplate(message);

  console.log('[Extension] Calling LLM API with prompt:', prompt);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        task: 'rephrase_grammar_enhance'
      })
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    console.log('[Extension] LLM API response:', data);
    return data.enhanced || message;
  } catch (e) {
    console.error('[Extension] LLM API error:', e);
    return message;
  }
}

// Listen for extension button click
if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    console.log('[Extension] Extension icon clicked. Tab:', tab);
    // Only run on Google Chat
    if (
      tab.url &&
      (tab.url.startsWith('https://chat.google.com/') ||
       tab.url.startsWith('https://mail.google.com/chat/'))
    ) {
      chrome.tabs.sendMessage(tab.id, { action: 'getMessage' }, async (response) => {
        console.log('[Extension] Got message from content script:', response);
        if (response && response.message) {
          // Call LLM API to enhance message
          const enhanced = await enhanceMessageWithLLM(response.message);
          console.log('[Extension] Sending enhanced message to content script:', enhanced);
          chrome.tabs.sendMessage(tab.id, { action: 'setMessage', message: enhanced });
        } else {
          console.warn('[Extension] No message found in chat input.');
        }
      });
    } else {
      console.warn('[Extension] Not a Google Chat tab.');
    }
  });
}

// For testability: export functions if in Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enhanceMessageWithLLM, promptTemplate };
}
