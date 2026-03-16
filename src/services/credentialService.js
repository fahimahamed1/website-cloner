const fs = require('fs');
const path = require('path');

const CREDENTIALS_FILE = path.join(__dirname, '../../data/credentials.json');
let credentialsStore = [];

function ensureDataDir() {
  const dataDir = path.dirname(CREDENTIALS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function saveToFile() {
  try {
    ensureDataDir();
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentialsStore, null, 2));
  } catch (error) {
    console.error('Failed to save credentials:', error.message);
  }
}

function loadFromFile() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      credentialsStore = JSON.parse(data);
    }
  } catch (error) {
    credentialsStore = [];
  }
}

loadFromFile();

function addCredential(credential) {
  const newCredential = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    ...credential
  };
  credentialsStore.unshift(newCredential);
  saveToFile();
  return newCredential;
}

function getAllCredentials() {
  return credentialsStore;
}

function getCount() {
  return credentialsStore.length;
}

function clearAll() {
  credentialsStore = [];
  saveToFile();
}

function deleteById(id) {
  const index = credentialsStore.findIndex(c => c.id === id);
  if (index !== -1) {
    credentialsStore.splice(index, 1);
    saveToFile();
    return true;
  }
  return false;
}

function getById(id) {
  return credentialsStore.find(c => c.id === id) || null;
}

module.exports = {
  addCredential,
  getAllCredentials,
  getCount,
  clearAll,
  deleteById,
  getById
};
