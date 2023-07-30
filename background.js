// background.js

// Function to open a new window for the password manager UI
function openPasswordManagerWindow() {
    // Adjust the width and height as needed
    const width = 400;
    const height = 500;
  
    chrome.windows.create(
      {
        url: chrome.extension.getURL('password_manager.html'),
        type: 'popup',
        width: width,
        height: height
      },
      function(window) {
        // Set a callback function if needed
      }
    );
  }
  

  // Function to open a new window for the account creation page
function openAccountCreationWindow() {
  // Adjust the width and height as needed
  const width = 400;
  const height = 300;

  chrome.windows.create(
    {
      url: chrome.extension.getURL('account_creation.html'),
      type: 'popup',
      width: width,
      height: height
    },
    function(window) {
      // Set a callback function if needed
    }
  );
}
  
  // Call the function to open the password manager window on extension icon click
  chrome.browserAction.onClicked.addListener(function(activeTab)
{
    chrome.windows.create({ url: chrome.runtime.getURL("popup.html"), type: 
    "popup" });
});