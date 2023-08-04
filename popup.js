// Function to store original passwords in memory (for demonstration purposes only)
const passwordMemory = {};

// Function to get stored passwords from Chrome storage
function getStoredPasswords(callback) {
  chrome.storage.local.get(['passwords'], function (result) {
    const passwords = result.passwords || {};
    callback(passwords);
  });
}

// Function to save passwords to Chrome storage
function savePasswords(passwords) {
  chrome.storage.local.set({ passwords: passwords });
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


function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Please enter a valid username and password.');
    return;
  }

  getStoredPasswords(function (passwords) {
    const storedPassword = passwords[username];

    if (storedPassword) {
      // Hash the input password to compare with the stored hashed password
      const hashedInputPassword = sha256(password);

      if (storedPassword.password === hashedInputPassword) {
        // On successful login, display stored passwords
        displayStoredPasswords(passwords);
      } else {
        alert('Invalid username or password. Please try again.');
      }
    } else {
      alert('Invalid username or password. Please try again.');
    }
  });
}

function generateUUID() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function displayStoredPasswords(passwords) {
  const passwordTable = document.getElementById('passwordTable');
  const passwordList = document.getElementById('passwordList');
  passwordList.innerHTML = '';

  for (const [site, storedPasswordObject] of Object.entries(passwords)) {
    // Retrieve the original username and password from memory using the UUID
    const uuid = storedPasswordObject.uuid;
    const passwordInfo = passwordMemory[uuid];

    if (!passwordInfo) {
      console.log(`Original password for site "${site}" is not available.`);
      continue;
    }

    const { username, password } = passwordInfo;

    // Create a new table row
    const row = document.createElement('tr');

    // Add username to the first cell
    const usernameCell = document.createElement('td');
    usernameCell.textContent = username;
    row.appendChild(usernameCell);

    // Add the original password to the second cell
    const passwordCell = document.createElement('td');
    passwordCell.textContent = password;
    row.appendChild(passwordCell);

    passwordList.appendChild(row);
  }
}


function savePassword(site, username, password) {
  // Generate a unique identifier (UUID) for this password entry
  const uuid = generateUUID();

  // Hash the password before saving it
  const hashedPassword = sha256(password);

  // Store the original username and password in memory (for demonstration purposes only)
  passwordMemory[uuid] = { username, password };

  getStoredPasswords(function (passwords) {
    passwords[username] = { password: hashedPassword, uuid: uuid };
    savePasswords(passwords);
    alert('Password saved successfully!');
  });
}

function handleAccountCreation() {
  const newUsername = document.getElementById('newUsername').value;
  const newPassword = document.getElementById('newPassword').value;

  if (!newUsername || !newPassword) {
    alert('Please enter a valid username and password.');
    return;
  }

  savePassword(newUsername, newUsername, newPassword);
}

function openAccountCreationWindow() {
  const passwordManagerContainer = document.querySelector('.container');
  const accountCreationContainer = document.getElementById('accountCreationContainer');

  passwordManagerContainer.style.display = 'none';
  accountCreationContainer.style.display = 'block';
}

document.getElementById('loginButton').addEventListener('click', handleLogin);
document.getElementById('generatePasswordButton').addEventListener('click', handleGeneratePassword);
document.getElementById('submitAccountButton').addEventListener('click', handleAccountCreation);