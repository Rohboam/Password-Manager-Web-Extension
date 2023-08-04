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

  // Calculate the password strength score
  const passwordStrength = calculatePasswordStrength(password);

  // Display the password strength score and recommendations
  displayPasswordStrength(passwordStrength);

  return password;
}


// Function to calculate password strength based on various criteria
function calculatePasswordStrength(password) {
  const minLength = 8; // Minimum length required for a strong password
  const maxLength = 64; // Maximum length for a strong password

  // Length score: Increase score linearly with password length
  const lengthScore = Math.min((password.length - minLength) / (maxLength - minLength) * 100, 100);

  // Complexity score: Increase score based on the presence of upper-case, lower-case, numbers, and special characters
  let complexityScore = 0;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+-=[]{}|;:,.<>?]/.test(password);

  const complexityCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  complexityScore = complexityCount * 25; // Increase score by 25 for each complexity criteria met

  // Repetition score: Penalize passwords with repeating characters
  const repeatingChars = /(.)\1{2,}/.test(password);
  const repeatingScore = repeatingChars ? -50 : 0;

  // Dictionary word score: Penalize passwords that contain common dictionary words
  const commonWords = ["password", "123456", "qwerty", "letmein", "admin", "welcome", "monkey", "password1"];
  const containsCommonWord = commonWords.some(word => password.toLowerCase().includes(word));
  const commonWordScore = containsCommonWord ? -50 : 0;

  // Calculate the total score for the password
  let totalScore = lengthScore + complexityScore + repeatingScore + commonWordScore;
  totalScore = Math.max(totalScore, 0); // Ensure the total score is non-negative

  return Math.min(totalScore, 100); // Cap the score at 100
}


// Function to display password strength score and recommendations
function displayPasswordStrength(score) {
  const strengthIndicator = document.getElementById('passwordStrengthIndicator');
  const strengthText = document.getElementById('passwordStrengthText');

  strengthIndicator.style.width = `${score}%`;
  strengthText.textContent = `Password Strength: ${score}%`;

  // Provide recommendations based on the score
  if (score >= 80) {
    strengthText.style.color = 'green';
    strengthText.textContent += ' (Strong)';
  } else if (score >= 50) {
    strengthText.style.color = 'orange';
    strengthText.textContent += ' (Moderate)';
  } else {
    strengthText.style.color = 'red';
    strengthText.textContent += ' (Weak). Please consider increasing length and complexity.';
  }
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

  // Calculate the password strength score for the entered password
  const passwordStrength = calculatePasswordStrength(password);

  // Display the password strength score and recommendations
  displayPasswordStrength(passwordStrength);

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