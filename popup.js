// Store the encryption key here
let encryptionKey;

// Function to generate the encryption key (if not already generated) and return it
async function getEncryptionKey() {
  if (!encryptionKey) {
    // If the encryption key is not already generated, generate it and save it to encryptionKey
    encryptionKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  return encryptionKey;
}


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
async function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Please enter a valid username and password.');
    return;
  }

  try {
    // Get the encryption key
    const encryptionKey = await getEncryptionKey();

    // Implement account authentication here (e.g., with the Python backend)
    authenticateUser(username, password, async function(isAuthenticated) {
      if (isAuthenticated) {
        // On successful login, show stored passwords
        getStoredPasswords(async function(passwords) {
          const passwordList = document.getElementById('passwordList');
          passwordList.innerHTML = '';
          for (const [site, storedPasswordObject] of Object.entries(passwords)) {
            try {
              // Decrypted password is stored in decryptedPassword variable
              const decryptedPassword = await decryptPassword(
                JSON.parse(storedPasswordObject.encryptedPassword),
                encryptionKey
              );

              const li = document.createElement('li');
              li.textContent = `${site}: ${decryptedPassword}`;
              passwordList.appendChild(li);
            } catch (error) {
              console.error('Error decrypting password:', error);
              alert('Failed to decrypt password. Please try again.');
            }
          }
        });
      } else {
        alert('Invalid username or password. Please try again.');
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    alert('Login failed. Please try again.');
  }
}


// Function to authenticate the user
function authenticateUser(username, password, callback) {
  getAllStoredPasswords(function(passwords) {
    const storedPassword = passwords[username];
    console.log(storedPassword)
    if (storedPassword) {
      // For demonstration purposes, let's assume the stored password is a JSON-serialized object
      const storedPasswordObject = JSON.parse(storedPassword.encryptedPassword);

      // Implement decryption here (e.g., with the Python backend)
      // For demonstration, let's assume decryptedPassword contains the actual password
      const decryptedPassword = decryptPassword(storedPasswordObject);

      if (password === decryptedPassword) {
        callback(true); // Authentication success
      } else {
        callback(false); // Authentication failed
      }
    } else {
      callback(false); // User not found (Authentication failed)
    }
  });
}


function getAllStoredPasswords(callback) {
  chrome.storage.sync.get(['passwords'], function(result) {
    const passwords = result.passwords || {};
    console.log(passwords)
    callback(passwords);
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




// Function to decrypt the password using AES-GCM
async function decryptPassword(storedPasswordObject, encryptionKey) {
  try {
    // Import the encryption key
    const importedEncryptionKey = await crypto.subtle.importKey(
      'jwk',
      encryptionKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const iv = storedPasswordObject.iv;
    const data = storedPasswordObject.data;

    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, importedEncryptionKey, data);
    const decoder = new TextDecoder();
    const decryptedPassword = decoder.decode(decryptedData);

    return decryptedPassword;
  } catch (error) {
    console.error('Error decrypting password:', error);
    throw new Error('Failed to decrypt password. Please try again.');
  }
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

    // Convert the encryptedPassword object to a JSON-serializable string
    const serializedEncryptedPassword = JSON.stringify(encryptedPassword);

    chrome.storage.sync.get(['passwords'], function(result) {
      const passwords = result.passwords || {};
      passwords[site] = {
        username: username,
        encryptedPassword: serializedEncryptedPassword, // Save the serialized string
      };
      chrome.storage.sync.set({ passwords: passwords }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving password:', chrome.runtime.lastError);
        alert('Failed to save password. Please try again.');
      } else {
        alert('Password saved successfully!');
        console.log(passwords);
      }
    });
    });
  } catch (error) {
    console.error('Error saving password:', error);
    alert('Failed to save password. Please try again.');
  }
}




// Function to handle account creation
function handleAccountCreation() {

  // Get the elements
  const newUsername = document.getElementById('newUsername').value;
  const newPassword = document.getElementById('newPassword').value;



  if (!newUsername || !newPassword) {
    alert('Please enter a valid username and password.');
    return;
  }

  // Save the username and password to Chrome storage
  savePassword(newUsername, newUsername, newPassword); // Use the username as the site for simplicity


  
}


// Function to open the account creation page in the existing window
function openAccountCreationWindow() {
  const passwordManagerContainer = document.querySelector('.container');
  const accountCreationContainer = document.getElementById('accountCreationContainer');

  passwordManagerContainer.style.display = 'none';
  accountCreationContainer.style.display = 'block';


}



document.getElementById('loginButton').addEventListener('click', handleLogin);
document.getElementById('generatePasswordButton').addEventListener('click', getAllStoredPasswords);
// Add event listener for the "Create Account" button
// document.getElementById('createAccountButton').addEventListener('click', openAccountCreationWindow);

document.getElementById('submitAccountButton').addEventListener('click', handleAccountCreation);



