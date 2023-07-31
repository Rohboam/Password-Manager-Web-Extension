// Function to get stored passwords from Chrome storage
function getStoredPasswords(callback) {
    chrome.storage.sync.get(['passwords'], function(result) {
      const passwords = result.passwords || {};
      callback(passwords);
    });
  }
  
  // Function to save passwords to Chrome storage
  function savePasswords(passwords) {
    chrome.storage.sync.set({ passwords: passwords });
  }
  
// Function to generate a random password based on options
function generatePassword() {
  const length = parseInt(document.getElementById('passwordLength').value);
  const includeUppercase = document.getElementById('includeUppercase').checked;
  const includeLowercase = document.getElementById('includeLowercase').checked;
  const includeNumbers = document.getElementById('includeNumbers').checked;
  const includeSpecialChars = document.getElementById('includeSpecialChars').checked;

  let charset = '';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset === '') {
    alert('Please select at least one character type for password generation.');
    return;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

  // Function to handle login and display stored passwords
  function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Implement account authentication here (e.g., with the Python backend)
  
    // On successful login, show stored passwords
    getStoredPasswords(function(passwords) {
      const passwordList = document.getElementById('passwordList');
      passwordList.innerHTML = '';
      for (const [site, encryptedPassword] of Object.entries(passwords)) {
        // Implement decryption here (e.g., with the Python backend)
        // Decrypted password is stored in decryptedPassword variable
  
        const li = document.createElement('li');
        li.textContent = `${site}: ${decryptedPassword}`;
        passwordList.appendChild(li);
      }
    });
  }
  
// Function to handle password generation and display the generated password
function handleGeneratePassword() {
  const generatedPassword = generatePassword();
  if (generatedPassword) {
    const passwordList = document.getElementById('passwordList');

    const li = document.createElement('li');
    li.textContent = `Generated Password: ${generatedPassword}`;
    passwordList.appendChild(li);

    // Implement encryption here (e.g., with the Python backend)
    // Save the encrypted password to Chrome storage
  }
}

// Function to generate a random IV (Initialization Vector)
function generateIV() {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  return iv;
}

// Function to encrypt the password using AES-GCM
async function encryptPassword(password, encryptionKey) {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, data);

  const encryptedPassword = {
    data: new Uint8Array(encryptedData),
    iv: iv,
  };

  return encryptedPassword;
}

// Function to save passwords to Chrome storage
async function savePassword(site, username, password) {
  
  try {
    const encryptionKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    const encryptedPassword = await encryptPassword(password, encryptionKey);

    chrome.storage.sync.get(['passwords'], function(result) {
      const passwords = result.passwords || {};
      passwords[site] = {
        username: username,
        encryptedPassword: encryptedPassword,
      };
      chrome.storage.sync.set({ passwords: passwords }, function() {
        alert('Password saved successfully!');
      });
    });
  } catch (error) {
    console.error('Error saving password:', error);
    alert('Failed to save password. Please try again.');
  }
}



// Function to handle account creation
function handleAccountCreation() {
  // // alert('Please enter a valid username and password.');

  // const passwordManagerContainer = document.querySelector('.container');
  // const accountCreationContainer = document.getElementById('accountCreationContainer');

  // passwordManagerContainer.style.display = 'none';
  // accountCreationContainer.style.display = 'block';

  
  // const newUsername = document.getElementById('newUsername').value;
  // const newPassword = document.getElementById('newPassword').value;

  // // Get the elements
  // const newUsernameElement = document.getElementById('newUsername');
  // const newPasswordElement = document.getElementById('newPassword');

  // // Assign values to the elements
  // newUsernameElement.value = 'test';
  // newPasswordElement.value = '1234';

  // console.log('newUsername:', newUsername);
  // console.log('newPassword:', newPassword);

  // if (!newUsername || !newPassword) {
  //   alert('Please enter a valid username and password.');
  //   return;
  // }

  // // Save the username and password to Chrome storage
  // savePassword(newUsername, newUsername, newPassword); // Use the username as the site for simplicity

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
  alert('Please enter a valid username and password.');
  return;
  }

    // Save the username and password to Chrome storage
  savePassword(username, username, password); // Use the username as the site for simplicity
  
}


// Function to open the account creation page in the existing window
function openAccountCreationWindow() {
  // alert('Please enter a valid username and password.');

  const passwordManagerContainer = document.querySelector('.container');
  const accountCreationContainer = document.getElementById('accountCreationContainer');

  passwordManagerContainer.style.display = 'none';
  accountCreationContainer.style.display = 'block';

  // const newUsername = document.getElementById('newUsername').value;
  // const newPassword = document.getElementById('newPassword').value;

  // if (!newUsername || !newPassword) {
  //   alert('Please enter a valid username and password.');
  //   return;
  // }

  // alert('Please enter a valid username and password.');
  // // Save the username and password to Chrome storage
  // savePassword(newUsername, newUsername, newPassword); // Use the username as the site for simplicity
}

// Function to go back to the main password manager UI
function goBackToPasswordManager() {
  const passwordManagerContainer = document.querySelector('.container');
  const accountCreationContainer = document.getElementById('accountCreationContainer');

  passwordManagerContainer.style.display = 'block';
  accountCreationContainer.style.display = 'none';
}


document.getElementById('loginButton').addEventListener('click', handleAccountCreation);
document.getElementById('generatePasswordButton').addEventListener('click', handleGeneratePassword);
// Add event listener for the "Create Account" button
document.getElementById('createAccountButton').addEventListener('click', openAccountCreationWindow);
// Add event listener for the "Back" button
document.getElementById('backButton').addEventListener('click', goBackToPasswordManager);

document.getElementById('submitAccountButton').addEventListener('click', handleAccountCreation);
